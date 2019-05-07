const fs = require('fs');
const nodeUrl = require('url');

const Config = require('../Config');
const Command = require('./Command');
const EventEmitter = require('../../commons/modules/EventEmitter');



module.exports = class Service extends EventEmitter {
    constructor ({sg, host, name}) {
        super();
        this.cache = {
            sg,
            host,
            name,
            timer: null,
            cmds: [
                /**
                 * {
                 *  cmd: {Command} command 物件
                 *  path: {String} 執行路徑
                 *  delay: {Number} 循環執行時間
                 *  enabled: {Boolean} 是否啟動,
                 * }
                 */
            ],

        };

    }

    get sg () { return this.cache.sg; }

    get host () { return this.cache.host; }

    get name () { return this.cache.name; }

    get json () {
        let {sg, name, host, cmds} = this.cache;
        cmds = cmds.map(({path, delay}) => ({path, delay}));
        return JSON.stringify({sg, name, host, cmds});
    }
    /**
     * 建立一項循環執行的命令
     * @param {string} path 執行路徑
     * @param {number} _delay 循環執行時間隔
     * @param {string} name 命令名稱
     * @return {Promise} Promise 物件
     */
    addCommand(path, _delay, name = '') {

        return new Promise((resolve, reject) => {

            let delay = Number(_delay);
            if (! delay || delay < 1000) {
                reject(`delay 必需是大於 1000 的正整數 >> ${_delay}`);
                return;
            }
            let url = nodeUrl.resolve(this.host, _path);
            this.cache.cmds.push({
                cmd: new Command({url, })
            })


            this.cache.cmds.push({
                path,
                name,
                delay
            });
            resolve();
        });

    }

    /**
     * 啟動命令
     * @param {string} path 命令名稱 (必需已新增的命令才能啟動)
     * @return {Promise} Promise 物件
     */
    runCommand(path) {
        return new Promise((resolve, reject) => {

            let cmd = this.cmds.find(c => c.path === path);
            if (! cmd) {
                reject(`查無此命令 > ${path}`);
                return;
            }
            cmd.running = true;
            cmd.lastTime = 0;
            resolve();
        });
    }

    executeCommand(path) {

    }


};


