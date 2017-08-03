const _ = require('lodash');
const clientPool = require('../clientPool');

const getCommandList = () => {
    const commandClients = clientPool.getCommandClients();
    return commandClients.map(ac => ac.command).join(', ');
};

const getActionList = () => {
    const actionClients = clientPool.getActionConfigs();
    return actionClients.map(ac => Object.keys(ac.actions).join(', ')).join(', ');
};

const getClientHealth = () => {
    const clients = clientPool.getAllClients();
    return Object.keys(clients).map(clientName => {
        const client = clients[clientName];
        let msg = '\n' + clientName;
        if (client.reachable) {
            msg += ' online';
        }
        else {
            msg += ' unreachable and was last seen at ' + new Date(client.lastSeen).toDateString();
        }
        return msg;
    }).join('\n');
};

module.exports = {
    commands: ['status', 'commands'],
    commandHandler: (command, phrase, context, reply) => {
        console.log('Status command');
        if (command === 'commands') {
            reply(`Commands available: ${getCommandList()}`);
        } else {
            reply(`Current status of Central Intelligence`);
            reply(`Actions available:\n${getActionList()}`);
            reply(`Commands available:\n${getCommandList()}`);
            reply(`Client status:\n${getClientHealth()}`);
        }
    }
};
