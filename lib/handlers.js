const clientPool = require('./clientPool');
const broker = require('./broker');
const langProcessor = require('./languageProcessor');

const register = (request, reply) => {
    const payload = request.payload;
    const clientName = payload.name;
    const clientActions = payload.actions;
    clientPool.add(clientName, {
        actions: clientActions,
        host: payload.host,
        port: payload.port
    });
    reply({ registered: true });
};

const message = (request, reply) => {
    const payload = request.payload;
    const name = payload.name;
    const message = payload.message;
    const context = payload.context;
    console.log(`Got a message from client ${name}: ${message}`);
    const tokenizedMessage = langProcessor.tokenize(message)
        .then(analysis => {
            console.log('Message tokenized');
            console.dir(analysis);
            const selectedClient = langProcessor.selectClient(analysis, clientPool.getActionConfigs());
            broker.relayMessage(clientPool.get(selectedClient.client), selectedClient.action, analysis, context);
        });

    reply('TODO: some return value');
};

const command = (request, reply) => {
    const payload = request.payload;
    const name = payload.name;
    const command = payload.command;
    const context = payload.context;
    reply("TODO: implement");
};

const reply = (request, reply) => {
    const payload = request.payload;

    const message = payload.message;
    const context = payload.context;
    const targetClient = context.origin;
    console.log(`Got a reply for client ${targetClient}: ${message}`);
    console.log(JSON.stringify(payload, null, 2));

    broker.replyMessage(clientPool.get(targetClient), message, context);

    reply('TODO: some return value');
};

module.exports = {
    register,
    message,
    command,
    reply
};
