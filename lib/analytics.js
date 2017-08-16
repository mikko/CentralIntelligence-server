const fs = require('fs');
const path = require('path');

const TOPICS = {
    BAD_MESSAGE: 'BAD_MESSAGE',
    GOOD_MESSAGE: 'GOOD_MESSAGE',
    COMMAND: 'COMMAND'
};

const writeReport = (topic, msg) => {
    const filePath = path.join(__dirname, `${topic}.log`);
    fs.appendFile(filePath, `${new Date().toISOString()}, ${msg}\n`, (err) => {
        if (err) {
            console.log('Could not write analysis');
        }
    });
};

const reportBadMessage = msg => writeReport(TOPICS.BAD_MESSAGE, msg);
const reportGoodMessage = (msg, c, a) => writeReport(TOPICS.GOOD_MESSAGE, `${msg} ${c}.${a}`);
const reportCommand = (command) => writeReport(TOPICS.COMMAND, `${command}`);

module.exports = {
    reportBadMessage,
    reportGoodMessage,
    reportCommand
};
