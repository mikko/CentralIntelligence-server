const fs = require('fs');
const path = require('path');

const internalCommands = [];

fs.readdirSync(__dirname).forEach(function(file) {
    // Ignore this file
    if (file !== 'index.js') {
        const commandFile = path.join(__dirname, file);
        internalCommands.push(require(commandFile));
        console.log(file);
    }
});

module.exports = internalCommands;
