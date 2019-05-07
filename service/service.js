const fs = require('fs');

const Config = require('./Config');

const app = require('express')();

const Console = require('../commons/Console');

let server;
if (Config.ssl.use) {
    const https = require('https');
    server = https.createServer({
        cert: fs.readFileSync(Config.ssl.cert),
        key: fs.readFileSync(Config.ssl.key),
    }, app);
} else {
    const http = require('http');
    server = http.createServer(app);
}

(() => {

    /* 啟動程序狀態監視 */
    if (! Config.live.enabled) {
        return;
    }
    let live = require('../commons/live')('javaserver', {
        port: Config.live.port,
        cmd: 'node javaserver',
        cwd: __dirname,
    });
    live.on('error', message => {
        Console.error(`Live Bot [Error]: ${message}`);
    });

    // live.on('connect.success', () => {
    //     live.setRestartCommand('node javaserver', __dirname);
    // });

    live.on('disconnect', () => {
        Console.warning('disconnect');
    });
})();

app.get('/', (req, res) => {
    res.send('<h4> Welcome </h4>');
});
server.listen(Config.serverPort, () => {
    Console.log('Sever Bound \n');

});

const io = require('socket.io')(server);

require('./modules/Client')(io);

