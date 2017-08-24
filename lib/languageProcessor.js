const simpleNLP = require('simple-nlp');

simpleNLP.init()
    .then(() => {
        console.log('Language processing ready');
    });

const tokenize = phrase => {
    return simpleNLP.analyzePhrase(phrase);
};

const getWordMatches = (analysis, targets) => {
    const matches = targets.map(target => {
        const words = target.keywords;
        const matchingWords = words.map(target => {
            const word = target.word;
            const type = target.type;
            return _.some(analysis.wordsByType[type], foundWord => foundWord === word);
        }).filter((a) => a);
        return {
            target: target.title,
            match: (matchingWords.length / words.length).toFixed(2)
        };
    });
    return matches;
};

const selectClient = (tokenizedMessage, actionConfigs) => {
    console.log('Selecting the best action for phrase', tokenizedMessage.originalMessage);
    console.log('Client choices');
    console.dir(actionConfigs);
    const matchingClients = actionConfigs.map(client => {
        const matchingActions = Object.keys(client.actions).map(actionKey => {
            const action = client.actions[actionKey];
            const exactPhrase = action.exactPhrase || '';
            if (exactPhrase.toLowerCase() === tokenizedMessage.originalMessage.toLowerCase()) {
                return {
                    client: client,
                    action: actionKey
                };
            }
            const keywordMatches = action.keywords.map(keyword => {
                const keywordType = keyword.type.toUpperCase();
                if (tokenizedMessage.wordsByType[keywordType] &&
                    tokenizedMessage.wordsByType[keywordType].indexOf(keyword.word) !== -1) {
                    return keyword;
                }
            }).filter(w => w !== undefined);
            console.dir(keywordMatches);
            const hitRate = keywordMatches.length; // keywordMatches.length / action.keywords.length;
            console.log(`Hit rate for ${actionKey}: ${hitRate}`);
            if (hitRate > 0) {
                return {
                    action: actionKey,
                    matchingKeywords: keywordMatches,
                    hitRate
                };
            }
        }).filter(action => action !== undefined).sort((a, b) => b.hitRate - a.hitRate);
        if (matchingActions.length > 0) {
            const bestMatch = matchingActions.reduce((max, action) => Math.max(action.hitRate, max), 0);
            return {
                client: client.name,
                matchingActions,
                bestMatch
            };
        }
    }).filter(action => action !== undefined).sort((a, b) => b.bestMatch - a.bestMatch);

    if (matchingClients.length > 0) {
        return {
            client: matchingClients[0].client,
            action: matchingClients[0].matchingActions[0].action
        };
    }
};

module.exports = {
    tokenize,
    selectClient
};
