import { EventEmitter } from "events";


type EventEmitters = {
    [key: string]: Function[]
};

export default class {

    _EventEmitters: Map<string, Function[]> = new Map();

    /**
     * 監聽此物件發出的事件
     * @param {String} name 監聽的事件名稱
     * @param {Function} fn 事件發生的 callback
     * @return {Function} 用來 destroy 此監聽動作的 Function
     */
    on (name: string, fn: Function) {
        const exists = this._EventEmitters.has(name);
        const fnArrs = this._EventEmitters.get(name) || [];
        // let events = this._EventEmitters[name];
        if (! exists) {
            this._EventEmitters.set(name, fnArrs)
        }
        fnArrs.push(fn);

        return this.off.bind(this, name, fn);
    }

    /**
     * destroy 綁定的監聽事件
     * 也可直接執行 on() 回傳的 Function, 達到同樣效果
     * @param {String} name 監聽的事件名稱
     * @param {Function} callback 綁定的 callback (必需與綁定時的 function 同源)
     */
    off (name: string, fn: Function) {
        const fnArrs = this._EventEmitters.get(name);
        if (fnArrs) {
            this._EventEmitters.set(name, fnArrs.filter(f => (f !== fn)));
        }
    }

    /**
     * 發出事件, 用來觸發 on 的綁定
     * @param {String} name 事件名稱
     * @param {Any} data 傳遞的參數
     */
    emit (name: string, data: any = null) {
        (this._EventEmitters.get(name) || []).forEach(fn => fn(data));
    }

    destroy () {
        this._EventEmitters.clear();
    }

};
