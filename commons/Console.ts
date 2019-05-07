const colors = require('colors/safe');
// import colors from 'colors/safe';



export default {

    error (...args: any[]) {
        console.log(colors.red(args.map(o => (typeof o === 'string') ? o.toString() : o).join(', ')));
        const stack = this.stack().slice(2)[0] || 'unknown file';
        console.log(colors.red(`## ${stack}`));

    },

    warning(...args: any[]) {

        console.log(colors.yellow(args.map(o => (typeof o === 'string') ? o.toString() : o).join(', ')));
        const stack = this.stack().slice(2)[0] || 'unknown file';
        console.log(colors.yellow(`## ${stack}`));

    },

    log (...args: any[]) {

        console.log(colors.white(args.map(o => (typeof o === 'string') ? o.toString() : o).join(', ')));
        const stack = this.stack().slice(2)[0] || 'unknown file';
        console.log(colors.white(`## ${stack}`));

    },

    info (...args: any[]) {
        console.log(colors.blue(args.map(o => (typeof o === 'string') ? o.toString() : o).join(', ')));
        const stack = this.stack().slice(2)[0] || 'unknown file';
        console.log(colors.blue(`## ${stack}`));
    },

    success (...args: any[]) {
        console.log(colors.green(args.map(o => (typeof o === 'string') ? o.toString() : o).join(', ')));
        const stack = this.stack().slice(2)[0] || 'unknown file';
        console.log(colors.green(`## ${stack}`));
    },

    stack () {
        const stack = (new Error).stack;
        return ((stack && stack.split('\n')) || []).slice(1).map(s => s.trim());
    }


};
