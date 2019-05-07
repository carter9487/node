const net = require('net');

function jsonParse (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}

module.exports = class {
    constructor (portOrIO, host = '127.0.0.1') {
        let events = {};
        let [port, io] = typeof portOrIO === 'number' ?
            [portOrIO, null] :
            [null, portOrIO];

        this.cache = {

            port,

            host,

            io,

            status: 'disconnected',

            events,

            /* 若斷線時, 是否嘗試重新連線 */
            reconnecting: true,
        };

        this.connect(portOrIO, host);

    }
    get io () { return this.cache.io; }

    get status () { return this.cache.status; }

    get reconnecting () { return this.cache.reconnecting; }

    set reconnecting (bool) { this.cache.reconnecting = Boolean(bool); }

    connect () {
        let {events, port, io, host} = this.cache;


        if (port) {
            io = net.connect(port, host, function() {
            });
        }
        io.on('connect', () => {
            this.cache.status = 'connected';
            (events.connect || []).forEach(cb => cb());
        });

        io.on('data', buffer => {
            let data = jsonParse(buffer.toString());
            if (data && Array.isArray(data)) {
                let [name, value] = data;
                (events[name] || []).forEach(cb => cb(value));
            }
        });

        io.on('error', err => {
            (events['error'] || []).forEach(cb => cb(err));
            this.reconnect();
        });

        io.on('end', () => {
            this.cache.status = 'disconnected';
            (events['disconnect'] || []).forEach(cb => cb());
            this.reconnect();
        });

        this.cache.io = io;
    }

    reconnect () {
        if (
            (this.status !== 'connected') &&
            this.reconnecting &&
            this.cache.port
        ) {
            setTimeout(() => {
                this.connect();
            }, 5000);
        }
    }

    disconnect () {
        this.io.end();
    }

    on (name, cb) {
        let callbacks = this.cache.events[name] || null;
        if (! callbacks) {
            callbacks = [];
            this.cache.events[name] = callbacks;
        }
        callbacks.push(cb.bind(this));
    }
    emit (name, value) {
        this.io.write(JSON.stringify([name, value]));
    }

};
