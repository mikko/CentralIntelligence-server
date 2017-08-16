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

const getUserProperties = ctx => _.get(ctx, '_user.properties', {});

const newReply = (newContext, reply) => {
    const user = getUser(newContext);
    const latestContext = sessionStorage.get(user);

    if (latestContext &&
        latestContext._question &&
        latestContext._question.answered) {

    }

    if (latestContext === undefined) {
        sessionStorage.set(user, newContext);
        return newContext;
    } else {
        const updatedContext = Object.assign({}, latestContext, newContext);
        sessionStorage.set(user, updatedContext);
        return updatedContext;
    }
};

const newMessage = (newContext, message) => {
    console.log('Context got new message');

    const user = getUser(newContext);
    const latestContext = sessionStorage.get(user);

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
    getUser,
    getUserProperties,
    ENTITIES
};
