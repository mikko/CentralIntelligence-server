const clientPool = require('./clientPool');
const broker = require('./broker');

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
    reply('TODO: some return value');
    broker.relayMessage(message, context);
};

const command = (request, reply) => {
    const payload = request.payload;
    const name = payload.name;
    const command = payload.command;
    const context = payload.context;
    reply("TODO: implement");
};

module.exports = {
    register,
    message,
    command
};
