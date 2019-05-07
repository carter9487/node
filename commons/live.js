const Socket = require('./modules/MySocket');

const PID = process.pid;

module.exports = function(name, params = {}) {

    let {
        port,
        cmd,
        cwd,
        host = '127.0.0.1',

    } = params;

    let io = new Socket(port, host);

    io.on('connect', function() {
        io.emit('register', {
            name,
            cmd,
            cwd,
            pid: PID,
        });
    });

    return {
        io,
        on: io.on.bind(io),
        emit: io.emit.bind(io),
        // setRestartCommand(cmd, cwd = null) {
        //     io.emit('restart.command', {cmd, cwd, pid: PID});
        // }
    };

};