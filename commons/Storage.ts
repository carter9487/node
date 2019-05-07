import Console from './Console';
import * as fs from 'fs';

export default class Storage {

    protected fpath: string = '';

    protected data: any = {};

    constructor (path: string) {
        this.fpath = path;
        if (!fs.existsSync(path)) {
            fs.writeFileSync(this.fpath, '');
        }
        this.reload();
    }


    save () {
        fs.writeFileSync(this.fpath, this.onSaveCallback(this.data));
        return this;
    }

    reload () {
        let buffer = fs.readFileSync(this.fpath, 'utf8');
        this.data = this.onReloadCallback(buffer);
        return this;
    }

    protected onSaveCallback (data: any) {
        return JSON.stringify(data);
    }

    protected onReloadCallback (buffer: string) {
        return JSON.parse(buffer);
    }

}