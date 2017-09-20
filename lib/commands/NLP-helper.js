const _ = require('lodash');
const langProcessor = require('../languageProcessor');

module.exports = {
    commands: ['analysis'],
    commandHandler: (command, phrase, context, reply) => {
        if (phrase === undefined || phrase.length === 0) {
            reply('Analysis command requires a phrase to analyze.\nTry: /analysis is it raining?');
            return;
        }
        langProcessor.tokenize(phrase)
            .then(analysis => {
                reply(`Natural language analysis for ${phrase}:`);
                const relevantParts = _.pick(analysis, [ 'originalMessage', 'tokenizedMessage', 'relationMap', 'entities', 'wordsByType']);
                console.log(JSON.stringify(relevantParts, null, 2));
                reply(`\`\`\`\n${JSON.stringify(relevantParts, null, 2)}\n\`\`\``);
            });
    }
};
