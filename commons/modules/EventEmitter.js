module.exports = class {
    /**
     * 初始化
     */
    constructor () {
        this._EventEmitters = {};
    }

    /**
     * 監聽此物件發出的事件
     * @param {String} name 監聽的事件名稱
     * @param {Function} callback 事件發生的 callback
     * @return {Function} 用來 destroy 此監聽動作的 Function
     */
    on (name, callback) {
        let events = this._EventEmitters[name];
        if (! events) {
            events = this._EventEmitters[name] = [];
        }
        events.push(callback);
        return () => {
            this._EventEmitters[name] = this._EventEmitters[name].filter(cb => cb !== callback);
        };
    }

    /**
     * destroy 綁定的監聽事件
     * 也可直接執行 on() 回傳的 Function, 達到同樣效果
     * @param {String} name 監聽的事件名稱
     * @param {Function} callback 綁定的 callback (必需與綁定時的 function 同源)
     */
    off (name, callback) {
        if (this._EventEmitters[name]) {
            this._EventEmitters[name] = this._EventEmitters[name].filter(cb => cb !== callback);
        }
    }

    /**
     * 發出事件, 用來觸發 on 的綁定
     * @param {String} name 事件名稱
     * @param {Any} data 傳遞的參數
     */
    emit (name, data = null) {
        (this._EventEmitters[name] || []).forEach(cb => cb(data));
    }

};
