
module.exports = class {

    constructor (io) {
        let cache = this.cache = {
            pid: 0,
            io,
            delay: 30000,
            progress: [],
            onEvents: {},
        };

        /* 收到對方發出的命令 */
        io.on('SEP.send', ({pid, name, data}) => {
            let event = cache.onEvents[name] || null;
            if (! event) {
                return;
            }

            let result = event(data);


            /* pid === 0 代表不需要回覆 */
            if (pid === 0) {
                return;
            }

            let promise = (result instanceof Promise) ?
                result :
                (new Promise(resolve => resolve(result)));
            promise.then(d => {
                io.emit('SEP.response', {pid, data: d});
            });
        });

        /* 收到對方回覆 */
        io.on('SEP.response', ({pid, data}) => {
            // let {progress, io, delay} = cache;
            let idx = cache.progress.findIndex(p => p.pid === pid);

            /* 找不到通常是 timeout 被移除 */
            if (! idx < 0) {
                return;
            }

            let prog = cache.progress.splice(idx, 1)[0];

            clearInterval(prog.interval);

            prog.resolve(data);

        });

    }

    set delay (value) {
        if ((typeof value !== 'number') || value <= 0) {
            console.error(`delay 必需為大於 0  的整數 : ${value}`);
            return;
        }
        this.cache.delay = parseInt(value, 10);
    }

    emitPromise (name, data = {}, options = {delay: 30000}) {
        let {progress, io, delay} = this.cache;
        let pid = (this.cache.pid += 1);
        let time = new Date().getTime();
        delay = options.delay || delay;
        let promise = new Promise((resolve, reject) => {

            /* timeout 時, 將程序停止, 並發出錯誤 */
            let interval = setInterval(() => {
                this.cache.progress = progress.filter(p => p.pid !== pid);
                reject(new Error('Time Out'));
            }, delay);

            progress.push({pid, time, interval, name, resolve, reject});
            io.emit(`SEP.send`, {pid, name, data});
        });
        return promise;
    }

    emit (name, data) {
        this.cache.io.emit(name, data);
    }

    on (name, callback) {
        this.cache.io.on(name, callback);
        if (this.cache.onEvents[name]) {
            throw new Error(`${name} 事件已註冊`);
        }
        this.cache.onEvents[name] = callback;
    }
};