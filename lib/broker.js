const request = require('request');

const relayMessage = (client, action, message, context) => {
    console.log(`Relaying message analysis ${message.originalMessage} to ${client} ${action}`);

    const uri = `http://${client.host}:${client.port}/message`;

    const body = {
        action,
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

const relayCommand = (client, command, parameters, context) => {
    console.log('Relaying command', command, 'to client', JSON.stringify(client));

    const uri = `http://${client.host}:${client.port}/command`;

    const body = {
        command,
        parameters,
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

const replyMessage = (client, message, context) => {
    console.log(`Replying message to ${client.name}: '${message}'`);

    const uri = `http://${client.host}:${client.port}/message`;
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
    relayMessage,
    replyMessage,
    relayCommand
};
