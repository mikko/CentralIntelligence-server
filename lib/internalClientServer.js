const _ = require('lodash');
const Client = require('ci-client');
const commands = require('./commands');

module.exports.start = (commonConfig) => {
    const commandNames = _.flatten(commands.map(cmd => cmd.commands));

    console.log('Internal commands found', commandNames);

    const clientConfig = Object.assign({
        name: 'internal-client',
        commands: commandNames,
        trustedUserGroups: 'all'
    }, commonConfig);

    const client = new Client(clientConfig);

    const messageReceiver = (action, message, context, reply) => {
        console.log(`Message received ${message}`);
        console.log('Should do an action now');
    };

    client.setReceiver(messageReceiver);

    const commandBroker = (command, params, context, reply) => {
        console.log('Command received', command);
        console.log('Command params', params);
        const internalCommand = _.find(commands, cmd => cmd.commands.indexOf(command) !== -1);
        console.log(internalCommand);
        if (internalCommand !== undefined) {
            console.log('Internal command');
            internalCommand.commandHandler(command, params, context, reply);
        } else {
            console.log('Something weird happening, no internal command here');
        }
    };

    client.setCommandHandler(commandBroker);
};
