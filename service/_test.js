const Config = require('./Config');
const fs = require('fs');
const path = require('path');

let services = [];

for (let sg = 0; sg <= 55; sg++) {

    let host = null;

    Object.keys(Config.SGHost).some(h => {

        if (Config.SGHost[h].indexOf(sg)) {
            host = h;
            return true;
        }
        return false;
    });


    services.push({
        sg,
        host,
        commands: [
            {path: 'SG1_c/service/serStarBet.php', delay: 1500},
            {path: 'SG1_c/service/serGame.php', delay: 1500},
            {path: 'SG1_c/BListFunc.php', delay: 1500},
            {path: 'SG1_c/service/serPlay.php', delay: 3000},
            {path: 'SG1_c/sf_301.php', delay: 60000},
            {path: 'SG1_c/sf_303.php', delay: 60000},
            /* 每 4H 刪除一次舊版的服數 (臨時方法 */
            {path: 'SG1_c/sf.php?cmd=892', delay: 4 * 60 * 60 * 1000},
        ]
    });

}

fs.writeFile(path.resolve(__dirname, Config.saveFile), JSON.stringify(services), err => {
    if (err) {
        console.info(err);
        return;
    }

    console.info('save success');
});




