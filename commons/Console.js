//const colors = require('colors/safe');


let log_w_color = function(c, args) {
        args.unshift('\x1b[' + c + 'm');
        args.push('\x1b[0m');
        console.log.apply(null, args);
};

const COL = {
    GRY: '1;30',
    HIR: '1;31',
    HIG: '1;32',
    HIY: '1;33',
    HIB: '1;34',
    HIM: '1;35',
    HIC: '1;36',
    HIW: '1;37',
    BLK: '30',
    RED: '31',
    GRE: '32',
    YEL: '33',
    BLU: '34',
    MAG: '35',
    CYN: '36',
    WHT: '37',


    log(c, args) {
        args.unshift('\x1b[' + c + 'm');
        args.push('\x1b[0m');
        console.log.apply(null, args);
    }
};

module.exports = {

    error (...args) {

        COL.log(COL.HIR, args);

    },

    warning(...args) {
        COL.log(COL.HIC, args);
    },

    log (...args) {
        COL.log(COL.BLK, args);

    },

    info (...args) {
        COL.log(COL.HIB, args);
    },

    success (...args) {
        COL.log(COL.HIG, args);

    },


};
