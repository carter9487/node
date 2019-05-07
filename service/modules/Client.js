
const nodePath = require('path');
const nodeUrl = require('url');
const fs = require('fs');

const SocketEmitPromise = require('../../commons/modules/SocketEmitPromise');
const Config = require('../Config');
const Command = require('./Command');
const Console = require('../../commons/Console');

let services = [];

const app = {

    io: null,

    loadSetting () {
        let buffer = fs.readFileSync(Config.saveFile, 'utf8');
        return JSON.parse(buffer.toString());
    },

    saveSetting () {
        return new Promise((resolve, reject) => {
            let data = services.map(service => {
                return {
                    sg: service.sg,
                    host: service.host,
                    name: service.name,
                    enabled: service.enabled,
                    commands: service.commands.map(cmd => cmd.json()),
                };
            });
            fs.writeFile(nodePath.resolve(__dirname, Config.saveFile), JSON.stringify(data), err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    },

    defaultServices() {
        let rows = [];
        for (let sg = 0; sg <= 5; sg++) {

            let host = null;

            Object.keys(Config.SGHost).some(h => {

                if (Config.SGHost[h].indexOf(sg) >= 0) {
                    host = h;
                    return true;
                }
                return false;
            });
            if (! host) {
                //throw `cannot find host >> ${sg}`;
                continue;
            }
            host = host.replace('{sg}', sg);
            Console.log('host: ' + host +'->'+ sg);
            rows.push({
                sg,
                host,
                name: `sg-${sg}`,
                enabled: true,
                commands: Config.cmds.map(cmd => {
                    return {
                        sg,
                        url: nodeUrl.resolve(host, cmd.path),
                        delay: cmd.delay,
                        name: cmd.name,
                        enabled: true
                    };
                })
            });
        }
        return rows;

    },
    initService () {
        let rows = fs.existsSync(Config.saveFile) ?
            app.loadSetting() :
            app.defaultServices();

        services = rows.map(service => {
            return {
                sg: service.sg,
                name: service.name,
                host: service.host,
                enabled: service.enabled,
                commands: service.commands.map(o => {
                    let cmd = new Command(o);

                    if (o.enabled) {
                        cmd.start();
                    }

                    cmd.on('command.update', () => {

                        Console.warning('cmd.onUpdate');
                        app.io.emit('command.update', {
                            sg: cmd.sg,
                            id: cmd.id,
                            name: cmd.name,
                            delay: cmd.delay,
                            enabled: cmd.enabled,
                        });
                    });

                    cmd.on('command.numErrors.update', nums => {
                        Console.error('cmd.onNumError');
                        app.io.emit('command.numErrors.update', {sg: cmd.sg, id: cmd.id, nums});
                    });

                    cmd.on('command.response', data => {
                        Console.info('cmd.onResponse');
                        app.io.emit('command.response', data);
                    });

                    cmd.on('command.error', data => {
                        Console.error('cmd.onError');
                        app.io.emit('command.error', data);
                    });

                    return cmd;
                }),
            };
        });
    },
    updateService (client, service) {
        app.saveSetting();
        client.emit('service.update', {sg: service.sg, name: service.name, enabled: service.enabled});
    },

    onSignIn(client) {

        let serviceDatas = services.map(service => {
            return {
                sg: service.sg,
                name: service.name,
                enabled: service.enabled,
                commands: service.commands.map(cmd => {
                    return {
                        id: cmd.id,
                        name: cmd.name,
                        delay: cmd.delay,
                        numErrors: cmd.numErros,
                        enabled: cmd.enabled,
                    };
                }),
            };
        });


        /* 送出服務資料更新 */
        client.emit('services', serviceDatas);

        client.on('service.save', ({sg, name}) => {
            let service = services.find(s => s.sg === sg);
            if (! service) {
                return app.fail(`操作失敗, 找不到 sg 資料 > ${sg}`);
            }
            service.name = name;
            app.updateService(client, service);
            return app.done();
        });

        client.on('service.enable', sg => {
            let service = services.find(s => s.sg === sg);
            if (! service) {
                return app.fail(`操作失敗, 找不到 sg 資料 > ${sg}`);
            }
            service.commands.forEach(cmd => cmd.stop());
            service.enabled = true;
            app.updateService(client, service);
            return app.done();
        });

        client.on('service.disable', sg => {
            let service = services.find(s => s.sg === sg);
            if (! service) {
                return app.fail(`操作失敗, 找不到 sg 資料 > ${sg}`);
            }
            service.enabled = false;
            service.commands.forEach(c => c.stop());
            app.updateService(client, service);

            return app.done();
        });


        /* 啟用服務程序 */
        client.on('command.start', ({sg, id}) => {
            let service = services.find(s => s.sg === sg);
            let cmd = service && service.commands.find(c => c.id === id) || null;
            if (! cmd) {
                return app.fail(`操作失敗, 找不到命令 ${id}`);
            }
            cmd.start();
            app.saveSetting();
            return app.done();
        });

        client.on('command.stop', ({sg, id}) => {
            let service = services.find(s => s.sg === sg);
            let cmd = service && service.commands.find(c => c.id === id) || null;
            if (! cmd) {
                return app.fail(`操作失敗, 找不到命令 ${id}`);
            }
            cmd.stop();
            app.saveSetting();
            return app.done();
        });

        client.on('command.start.all', sg => {
            let service = services.find(s => s.sg === sg);
            if (! service) {
                return app.fail(`操作失敗, 找不到 sg 資料 > ${sg}`);
            }
            service.commands.forEach(cmd => cmd.start());
            app.saveSetting();
            return app.done();
        });

        client.on('command.stop.all', sg => {
            let service = services.find(s => s.sg === sg);
            if (! service) {
                return app.fail(`操作失敗, 找不到 sg 資料 > ${sg}`);
            }
            service.commands.forEach(cmd => cmd.stop());
            app.saveSetting();
            return app.done();
        });

        let commandWatchs = [];

        client.on('command.watch', ({sg, id}) => {
            let service = services.find(s => s.sg === sg);
            let cmd = service && service.commands.find(c => c.id === id) || null;
            if (! cmd) {
                return app.fail(`操作失敗, 找不到命令 ${id}`);
            }
            commandWatchs.forEach(off => off());
            commandWatchs = [
                cmd.on('command.response.add', res => {
                    client.emit('command.response.add', res);
                }),
                cmd.on('command.error.add', res => {
                    client.emit('command.error.add', res);
                }),
                cmd.on('command.error.clear', () => {
                    client.emit('command.error.clear', null);
                }),
            ];

            return app.done({
                responses: cmd.responses,
                errors: cmd.errors,
            });

        });

        client.on('command.unwatch', () => {
            commandWatchs.forEach(off => off());
            return app.done();
        });

        /**
         * 清除命令執行的錯誤記錄
         */
        client.on('command.clear.error', ({sg, id}) => {
            let service = services.find(s => s.sg === sg);
            let cmd = service && service.commands.find(c => c.id === id) || null;
            if (! cmd) {
                return app.fail(`操作失敗, 找不到命令 ${id}`);
            }
            cmd.clearError();
            return app.done();
        });

        /**
         * 測試命令相關設定
         */
        let testCommand = new Command({name: 'test-command'});
        client.on('test.run', ({sg, path}) => {
            let service = services.find(s => s.sg === sg);
            if (! service) {
                return app.fail(`操作失敗, 找不到 sg 資料 > ${sg}`);
            }
            path = path[0] === '/' ? path.substr(1) : path;

            return new Promise((resolve) => {
                /* 變更 url */
                testCommand.url = nodeUrl.resolve(service.host, path);
                testCommand.execute().then(result => {
                    resolve(app.done({type: 'response', result, path}));
                }, result => {
                    resolve(app.done({type: 'error', result, path}));
                });
            });
        });



        client.on('disconnect', () => {
            Console.info('disconnect');
            commandWatchs.forEach(off => off());
        });
    },

    done (data = 'done') {
        return (typeof data === 'string') ?
            {status: true, message: data} :
            Object.assign({status: true}, data);
    },

    fail (data = 'fail') {
        return (typeof data === 'string') ?
            {status: false, message: data} :
            Object.assign({status: false}, data);

    }

};



module.exports = function (io) {

    app.initService();
    app.io = io;

    io.on('connection', cio => {
        Console.info('connect');

        const client = new SocketEmitPromise(cio);

        client.emit('signin.status', false);

        client.on('signin', password => {

            if (password === Config.passwords.admin) {
                app.onSignIn(client);
                return app.done('登入成功');
            }
            return app.fail('密碼不正確');
        });

    });




};