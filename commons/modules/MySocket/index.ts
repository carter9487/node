
import * as  net from 'net';

type Cache = {
    port: number;
    host: string;
    io: net.Socket | null;
    status: string;
    events: {
        [key: string]: Function[]
    };
    reconnecting: boolean;

}



function jsonParse (str: string) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}

export default class {

    cache: Cache = {
        port: 0,
        host: '',
        io: null,
        status: 'disconnected',
        events: {},

        /* 若斷線時, 是否嘗試重新連線 */
        reconnecting: true,
    };

    constructor (portOrIO: any, host = '127.0.0.1') {
        let events = {};
        let port: number = 0;
        let io: any = null;;
        if (typeof portOrIO === 'number') {
            port = Number(portOrIO);
        } else {
            io = portOrIO;
        }
        // let [port, io] = typeof portOrIO === 'number' ?
        //     [portOrIO, null] :
        //     [null, portOrIO];

        this.cache.port = port;
        this.cache.host = host;
        this.cache.io = io;

        this.connect();

    }
    get io () { return this.cache.io; }

    get status () { return this.cache.status; }

    get reconnecting () { return this.cache.reconnecting; }

    set reconnecting (bool) { this.cache.reconnecting = Boolean(bool); }

    connect () {
        let {events, port, host} = this.cache;

        let io = net.connect(port, host);

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
        this.io && this.io.end();
        // this.io.end();
    }

    on (name: string, cb: Function) {
        let callbacks = this.cache.events[name] || null;
        if (! callbacks) {
            callbacks = [];
            this.cache.events[name] = callbacks;
        }
        callbacks.push(cb.bind(this));
    }
    emit (name: string, value: any) {
        if (this.io) {
            this.io.write(JSON.stringify([name, value]));
        }
    }

};
