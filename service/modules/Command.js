const request = require('request');
const iconv = require('iconv-lite');
const Console = require('../../commons/Console');

const EventEmitter = require('../../commons/modules/EventEmitter');

let autoIncrement = 0;

const RESPONSES_LENGTH = 30;
const ERRORS_LENGTH = 30;

module.exports = class Command extends EventEmitter {

    constructor ({sg = null, url = null, name = null, delay = 5000}) {

        super();

        this.cache = {

            id: ++ autoIncrement,

            sg,

            lastTime: 0,

            url,

            name,

            delay,

            enabled: false,

            remark: null,

            running: false,

            interval: null,

            responses: [],

            errors: [],

            tickTimer: false,

        };
    }
    get id () { return this.cache.id; }

    get sg () { return this.cache.sg; }

    get url () { return this.cache.url; }

    get name () { return this.cache.name; }

    get delay () { return this.cache.delay; }

    get enabled () { return this.cache.enabled; }

    get responses () { return this.cache.responses; }

    get errors () { return this.cache.errors; }

    get numErros () { return this.cache.errors.length; }

    set name (name) {
        this.cache.name = name;
        this.update();
    }

    set delay (delay) {
        this.cache.delay = Number(delay);
        this.update();
    }

    set url (url) {
        this.cache.url = url;
    }

    update () {
        if (! this.cache.tickTimer) {
            this.cache.tickTimer = setTimeout(() => {
                this.emit('command.update');
                this.cache.tickTimer = null;
            }, 0);
        }
    }

    updateNumErrors () {
        this.emit('command.numErrors.update', this.cache.errors.length);
    }


    json () {
        return {
            sg: this.sg,
            name: this.name,
            url: this.url,
            delay: this.delay,
            enabled: this.enabled,
        };

    }

    clearError () {
        this.cache.errors = [];
        this.updateNumErrors();
    }

    start () {
        if (! this.enabled) {
            this.cache.enabled = true;

            /* 先執行一次 */
            this.execute();

            this.cache.interval = setInterval(() => {
                this.execute();
            }, this.delay);

            this.update();
        }
    }

    stop () {

        if (this.enabled || this.cache.interval) {
            this.cache.enabled = false;
            clearInterval(this.cache.interval);
            this.update();
        }
    }

    execute () {
        let stime = new Date().getTime();
        return new Promise((resolve, reject) => {
            if (this.cache.running) {
                reject('指令執行中... (delay 間隔不足 or 程序執行過久');
                return;
            }

            this.cache.running = true;
            request({url: this.url, encoding: null}, (err, response, buffer) => {
                let statusCode = response && response.statusCode || null;
                if (err) {
                    reject(err.message);
                } else if (response.statusCode !== 200) {
                    let statusError = `Request Failed.\nStatus Code: ${statusCode}<br/>`;
                    reject(statusError + iconv.decode(new Buffer(buffer), 'big5'));
                } else {
                    resolve(iconv.decode(new Buffer(buffer), 'big5'));
                }

            });
        }).then(message => {
            this.cache.running = false;
            let res = {
                time: stime,
                runtime: new Date().getTime() - stime,
                message,
            };
            this.cache.responses.unshift(res);
            this.cache.responses = this.cache.responses.slice(0, RESPONSES_LENGTH);
            this.emit('command.response.add', res);
            return res;
        }, message => {
            this.cache.running = false;
            let res = {
                time: stime,
                runtime: new Date().getTime() - stime,
                message,
            };
            this.cache.errors.unshift(res);
            this.cache.errors = this.cache.errors.slice(0, ERRORS_LENGTH);
            this.emit('command.error.add', res);

            Console.info(this.name+':'+this.url, this.cache.errors[0]);
            this.updateNumErrors();

            return res;
        });


    }


};





