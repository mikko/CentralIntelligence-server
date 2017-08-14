const _ = require('lodash');
const User = require('../user');

module.exports = {
    commands: ['setGroupUsers'],
    commandHandler: (command, params, context, reply) => {
        if (command === 'setGroupUsers') {
            User.setGroupForUsers(params);
        }
    }
};
