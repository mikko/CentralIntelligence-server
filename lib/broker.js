const request = require('request');

const relayMessage = (client, action, messageAnalysis, context) => {
    console.log('Relaying message analysis', messageAnalysis.originalMessage, context);
    console.log('Relaying action', action, 'to client', JSON.stringify(client, null, 2));

    const uri = `http://${client.host}:${client.port}/message`;

    const clientMessage = {
        originalMessage: messageAnalysis.originalMessage,
        tokenizedMessage: messageAnalysis.tokenizedMessage
    };

    // List found entities in message relevant to the client
    if (client.actions[action].entities !== undefined) {
        client.actions[action].entities.forEach(entityType => clientMessage[entityType] = messageAnalysis.entities[entityType]);
    }

    const body = {
        action,
        message: clientMessage,
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
    console.log('Replying message ', message, context);
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
    replyMessage
};
