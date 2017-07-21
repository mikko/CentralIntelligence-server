const request = require('request');

const relayMessage = (message, context) => {
    console.log('Relaying message', message, context);

    const uri = `http://localhost:3002/message`;
    const body = {
        message,
        context
    };

    request.post({
        uri,
        body: JSON.stringify(body)
    },
    function (err, res, body) {
        if (err || res.statusCode !== 200) {
            console.log('Error connecting to client', err);
        }
    });

};

module.exports = {
    relayMessage
};
