const request = require('request');

class MyRequest {
    post (url, form = null, json = true) {
        return new Promise((resolve, reject) => {
            request.post({url, form}, (err, response, buffer) => {
                let statusCode = response && response.statusCode || null;
                if (err) {
                    reject(err.message);
                } else if (response.statusCode !== 200) {
                    let statusError = `Request Failed.\nStatus Code: ${statusCode}<br/>`;
                    reject(statusError + buffer.toString());
                } else {
                    let str = buffer.toString();
                    try {
                        json ? resolve(JSON.parse(str)) : resolve(str);
                    } catch (e) {
                        reject(str);
                    }
                }
            });
        });
    }
}
module.exports = new MyRequest();