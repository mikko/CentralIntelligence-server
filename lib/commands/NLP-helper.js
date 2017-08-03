const _ = require('lodash');
const langProcessor = require('../languageProcessor');

module.exports = {
    commands: ['analysis'],
    commandHandler: (command, phrase, context, reply) => {
        console.log('NLP helper');
        langProcessor.tokenize(phrase)
            .then(analysis => {
                reply(`Natural language analysis for ${phrase}:`);
                const relevantParts = _.pick(analysis, [ 'originalMessage', 'tokenizedMessage', 'entities', 'wordsByType']);
                console.log(JSON.stringify(relevantParts, null, 2));
                reply(JSON.stringify(relevantParts, null, 2));
            });
    }
};
