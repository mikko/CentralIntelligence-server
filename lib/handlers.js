const _ = require('lodash');
const fallbackAnswer = require('./fallbackAnswer');
const clientPool = require('./clientPool');
const broker = require('./broker');
const langProcessor = require('./languageProcessor');
const Context = require('./contextUtil');
const Analytics = require('./analytics');

const register = (request, reply) => {
    const payload = request.payload;
    const clientName = payload.name;
    const clientActions = payload.actions;
    const clientCommands = payload.commands;

    const authKey = payload.authKey;
    const trustedUserGroups = payload.trustedUserGroups;

    const registered = clientPool.add(clientName, {
        actions: clientActions,
        commands: clientCommands,
        host: payload.host,
        port: payload.port,
        authKey,
        trustedUserGroups
    });
    reply({ registered });
};

const message = (request, reply) => {
    const payload = request.payload;
    const message = payload.message;
    const messageContext = payload.context;

    langProcessor.tokenize(message)
        .then(analysis => {
            const latestContext = Context.getLatestContext(messageContext);

            const unansweredQuestion = latestContext !== undefined &&
                latestContext._question &&
                !latestContext._question.answered;

            let selectedClient;

            if (unansweredQuestion) {
                const MAX_INVALID_ANSWERS = 2;

                selectedClient = { action: latestContext._actionName, client: latestContext._actionClient };

                // Include the answer in context
                const questionKey = latestContext._question.key;

                if (Array.isArray(latestContext._question.options)) {
                    if (analysis.entities.cardinal.length > 0) {
                        const answerIndex = analysis.entities.cardinal[0] - 1; // From human index to 0-based
                        latestContext[questionKey] = latestContext._question.options[answerIndex];
                        latestContext._question.answered = true;
                    } else {
                        const possibleAnswers = latestContext._question.options;
                        const currentAnswer = analysis.originalMessage;
                        const answerMatches = possibleAnswers.indexOf(currentAnswer) !== -1;

                        if (answerMatches) {
                            latestContext[questionKey] = latestContext._question.options[answerIndex];
                            latestContext._question.answered = true;
                        } else {
                            latestContext._invalidAnswers = latestContext._invalidAnswers === undefined ?
                                1 :
                                latestContext._invalidAnswers + 1;

                            // Kill the conversation if too many invalid answers
                            if (latestContext._invalidAnswers >= MAX_INVALID_ANSWERS) {
                                latestContext._question.answered = true;
                                selectedClient = undefined;
                            }
                        }
                    }
                } else {
                    latestContext[questionKey] = analysis.originalMessage;
                    latestContext._question.answered = true;
                }
            }

            if (selectedClient === undefined ) {
                selectedClient = langProcessor.selectClient(analysis, clientPool.getActionConfigs());
            }

            const clientMessage = {
                originalMessage: analysis.originalMessage,
                tokenizedMessage: analysis.tokenizedMessage,
                entities: analysis.entities
            };

            const context = Context.newMessage(payload.context, clientMessage);

            let action = '';
            let clientName = '';

            if (selectedClient !== undefined) {
                action = selectedClient.action;
                clientName = selectedClient.client;
            }

            // No target found for message, reply to original sender with error message
            if (selectedClient === undefined) {
                const targetClient = context._origin;
                fallbackAnswer.getAnswer(analysis)
                    .then(answer => {
                        if (answer !== undefined) {
                            broker.replyMessage(clientPool.get(targetClient), answer, context);
                        } else {
                            Analytics.reportBadMessage(clientMessage.originalMessage);
                            let errorMessage = 'No comprende¿';
                            broker.replyMessage(clientPool.get(targetClient), errorMessage, context);
                        }
                    })
                    .catch(() => {
                        Analytics.reportBadMessage(clientMessage.originalMessage);
                        let errorMessage = 'I may have some moisture in my circuits';
                        broker.replyMessage(clientPool.get(targetClient), errorMessage, context);
                    });
            }
            // Target client not reachable, reply to original sender with error message
            else if (clientPool.get(clientName).reachable === false) {
                const targetClient = context._origin;
                const errorMessage = `Could not reach ${clientName}`;
                Analytics.reportGoodMessage(clientMessage.originalMessage, clientName, action);
                broker.replyMessage(clientPool.get(targetClient), errorMessage, context);
            }
            // Proper target found, relay the message to target client
            else {
                Analytics.reportGoodMessage(clientMessage.originalMessage, clientName, action);
                broker.relayMessage(clientPool.get(clientName), action, clientMessage, context);
            }

        });

    reply('Message received OK');
};

const command = (request, reply) => {
    const payload = request.payload;
    const command = payload.command;
    const params = payload.parameters || payload.JSONPayload;
    const context = payload.context;

    const clients = clientPool.getCommandClients();
    const commandClient = _.find(clients, client => command === client.command);

    if (commandClient !== undefined) {
        Analytics.reportCommand(command);
        broker.relayCommand(clientPool.get(commandClient.name), command, params, context);
    } else {
        console.log(`Did not find a client for command ${command}`);
    }

    reply("Command received OK");
};

const reply = (request, reply) => {
    const payload = request.payload;
    let message = payload.message;
    const context = Context.newReply(payload.context);
    const targetClient = context._origin;

    const isUnansweredQuestion = context._question && context._question.answered === false;

    if (isUnansweredQuestion) {
        const questionOptions = context._question.options || [];
        const optionsList = questionOptions.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
        message = `${message}?\n\n${optionsList}`;
    }
    broker.replyMessage(clientPool.get(targetClient), message, context);

    reply('Reply received OK');
};

module.exports = {
    register,
    message,
    command,
    reply
};
