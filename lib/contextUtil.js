const _ = require('lodash');

// Should be persisted
const sessionStorage = new Map();

// TODO: move elsewhere
const ENTITIES = [
    'persons',
    'nationalities',
    'facilities',
    'organisations',
    'locations',
    'locations',
    'products',
    'events',
    'art',
    'languages',
    'dates',
    'times',
    'percentages',
    'money',
    'quantities',
    'ordinal',
    'cardinal'
];

const constants = {
    MESSAGES: '_messages',
    ENTITY_HISTORY: '_entityHistory',
    LATEST_ENTITIES: '_latestEntities',
    REPLIES: '_replies',
    HISTORY_DEPTH: 5
};

const now = () => new Date().toISOString();

const getUser = ctx => _.get(ctx, '_user.user');

const newReply = (newContext, reply) => {
    console.log('Context got new reply');
    console.log(JSON.stringify(newContext, null, 2));

    const user = getUser(newContext);
    const latestContext = sessionStorage.get(user);

    if (latestContext &&
        latestContext._question &&
        latestContext._question.answered) {

    }

    console.log('latestContext', JSON.stringify(latestContext, null, 2));

    if (latestContext === undefined) {
        sessionStorage.set(user, newContext);
        return newContext;
    } else {
        const updatedContext = Object.assign({}, latestContext, newContext);
        sessionStorage.set(user, updatedContext);
        console.log('Updated context');
        console.log(JSON.stringify(updatedContext, null, 2));
        return updatedContext;
    }




    // const contextEntry = { timestamp: now(), reply };
    // if (context[constants.MESSAGES] === undefined) {
    //     context[constants.MESSAGES] = [contextEntry];
    // }
    // else {
    //     const messages = context[constants.MESSAGES];
    //     const lastMessage = messages[0];
    //     if (lastMessage[constants.REPLIES] === undefined) {
    //         lastMessage[constants.REPLIES] = [contextEntry];
    //     } else {
    //         lastMessage[constants.REPLIES].unshift(contextEntry);
    //     }
    // }
};

const newMessage = (newContext, message) => {
    console.log('Context got new message');
    console.log(JSON.stringify(newContext, null, 2));

    const user = getUser(newContext);
    const latestContext = sessionStorage.get(user);

    console.log('latestContext', JSON.stringify(latestContext, null, 2));

    if (latestContext === undefined) {
        newContext[constants.ENTITY_HISTORY] = [message.entities];
        newContext[constants.LATEST_ENTITIES] = message.entities;
        sessionStorage.set(user, newContext);
        return newContext;
    } else {
        if (Array.isArray(latestContext[constants.ENTITY_HISTORY])) {
            latestContext[constants.ENTITY_HISTORY].unshift(message.entities);
        } else {
            latestContext[constants.ENTITY_HISTORY] = [message.entities];
        }
        if (latestContext[constants.ENTITY_HISTORY].length > constants.HISTORY_DEPTH) {
            latestContext[constants.ENTITY_HISTORY].pop();
        }

        const entityHistoryReversed = latestContext[constants.ENTITY_HISTORY].reverse().map(historyItem => {
            const result = {};
            Object.keys(historyItem).forEach(key => {
                if (historyItem[key].length > 0) {
                    result[key] = historyItem[key];
                }
            });
            return result;
        });
        latestContext[constants.LATEST_ENTITIES] = Object.assign.apply(null, [{}, ...entityHistoryReversed]);

        const updatedContext = Object.assign({}, latestContext, newContext);
        sessionStorage.set(user, updatedContext);
        return updatedContext;
    }
};

const getLatestContext = ctx => {
    // If latest context includes an answered question, clear the whole context
    const latestContext = sessionStorage.get(getUser(ctx));
    if (latestContext && latestContext._question && latestContext._question.answered) {
        const freshContext = {
            previousContext: latestContext
        };

        sessionStorage.set(getUser(ctx), freshContext);
        return freshContext;
    }
    return latestContext;
};

module.exports = {
    newReply,
    newMessage,
    getLatestContext,
    ENTITIES
};
