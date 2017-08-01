const _ = require('lodash');
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
    const tokenizedMessage = langProcessor.tokenize(message)
        .then(analysis => {
            const selectedClient = langProcessor.selectClient(analysis, clientPool.getActionConfigs());
            if (selectedClient === undefined) {
                const targetClient = context.origin;

                let tries = 0;
                let randomWord;
                do {
                    ++tries;
                    randomWord = _.sample(analysis.fullAnalysis);
                } while( randomWord.relatedWords.length === 0 || tries < 5);
                const randomRelated = _.sample(randomWord.relatedWords);

                let errorMessage = 'Not sure how to help you.';
                if (randomRelated !== undefined) {
                    errorMessage = `Did you know a ${randomRelated.lemma} is ${randomRelated.def}?`;
                }
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
    broker.replyMessage(clientPool.get(targetClient), message, context);

    reply('TODO: some return value');
};

module.exports = {
    register,
    message,
    command,
    reply
};
