const _ = require('lodash');
const clientPool = require('./clientPool');
const broker = require('./broker');
const langProcessor = require('./languageProcessor');

const register = (request, reply) => {
    const payload = request.payload;
    const clientName = payload.name;
    const clientActions = payload.actions;
    const clientCommands = payload.commands;
    clientPool.add(clientName, {
        actions: clientActions,
        commands: clientCommands,
        host: payload.host,
        port: payload.port
    });
    reply({ registered: true });
};

const message = (request, reply) => {
    const payload = request.payload;
    const message = payload.message;
    const context = payload.context;
    langProcessor.tokenize(message)
        .then(analysis => {
            const selectedClient = langProcessor.selectClient(analysis, clientPool.getActionConfigs());
            if (selectedClient === undefined) {
                const targetClient = context.origin;
                let errorMessage = 'Not sure how to help you.';
                broker.replyMessage(clientPool.get(targetClient), errorMessage, context);
            } else if (clientPool.get(selectedClient.client).reachable === false) {
                const targetClient = context.origin;
                const errorMessage = `Could not reach ${selectedClient.client}`;
                broker.replyMessage(clientPool.get(targetClient), errorMessage, context);
            } else {
                broker.relayMessage(clientPool.get(selectedClient.client), selectedClient.action, analysis, context);
            }
        });

    reply('TODO: some return value');
};

const command = (request, reply) => {
    const payload = request.payload;
    const command = payload.command;
    const params = payload.parameters;
    const context = payload.context;

    const clients = clientPool.getCommandClients();
    const commandClient = _.find(clients, client => command === client.command);

    if (commandClient !== undefined) {
        broker.relayCommand(clientPool.get(commandClient.name), command, params, context);
    } else {
        console.log(`Did not find a client for command ${command}`);
    }

    reply("TODO: some return value");
};

const reply = (request, reply) => {
    const payload = request.payload;
    const message = payload.message;
    const context = payload.context;
    const targetClient = context.origin;

    broker.replyMessage(clientPool.get(targetClient), message, context);

    reply('TODO: some return value');
};

module.exports = {
    register,
    message,
    command,
    reply
};
