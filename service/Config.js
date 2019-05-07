let path = require('path');

let SGHost = global.DEV_MODE ? {
    'http://127.0.0.1/javaserver{sg}': [0]
} : {
    'http://127.0.0.1': [0,1,2]
};

module.exports = {
    serverPort: 8807,
    live: {
        enabled: false,
        port: 8800,
    },
    ssl: {
        use: false,
        cert: path.resolve(__dirname, '../crt/cm589.net.crt'),
        key: path.resolve(__dirname, '../crt/SSL.KEY'),
    },
    passwords: {
        admin: 'p@ssw0rd',
    },
    saveFile: path.resolve(__dirname, '/saved/javaserverSetting.json'),
    cmds: [
        {name: 't1', path: 'shishi/bet/77777.qoo.123', delay: 1500},
        {name: 'g2', path: 'shishi/bet/gateway.php', delay: 1500},


    ],
    SGHost,
};