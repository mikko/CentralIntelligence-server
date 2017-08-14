const request = require('request');
const User = require('./user');

const relayMessage = (client, action, message, context) => {
    User.refreshUser(context);

    console.log(`Relaying message analysis ${message.originalMessage} to ${client} ${action}`);

    const uri = `http://${client.host}:${client.port}/message`;

    const body = {
        action,
        message,
        context
    };

    if (!User.isTrustedUser(context, client.trustedUserGroups)) {
        console.log('Not a trusted user');
        console.log(JSON.stringify(context, null, 2));
        console.log(JSON.stringify(client, null, 2));
        return false;
    } else {
        console.log('Trusted user. Continuing');
    }

    request.post({
        uri,
        body: JSON.stringify(body)
    },
    function (err, res, body) {
        if (err || res.statusCode !== 200) {
            console.log('Error connecting to client', err);
        }
    });
    return true;
};

const relayCommand = (client, command, parameters, context) => {
    User.refreshUser(context);
    console.log('Relaying command', command, 'to client', JSON.stringify(client));

    const uri = `http://${client.host}:${client.port}/command`;

    if (!User.isTrustedUser(context, client.trustedUserGroups)) {
        if (client.trustedUserGroups !== undefined) {
            console.log('Not a trusted user');
            console.log(JSON.stringify(context, null, 2));
            console.log(JSON.stringify(client, null, 2));
        }
        return false;
    } else {
        console.log('Trusted user. Continuing');
    }


    const body = {
        command,
        context
    };

    if (typeof parameters === 'string') {
        body.parameters = parameters
    } else if (typeof parameters === 'object') {
        body.JSONpayload = parameters;
    }

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
