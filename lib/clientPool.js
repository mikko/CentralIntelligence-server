const request = require('request');


const heartbeatInterval = 1000 * 60;

const dataStorage = new Map();

const add = (name, client) => {
    if (dataStorage.has(name)) {
        throw new Error('Trying to register duplicate client');
    }
    dataStorage.set(name, client);
    console.log(`${name} registered!`);
    console.log(JSON.stringify(client, null, 2));
};

const get = name => {
    if (!dataStorage.has(name)) {
        throw new Error('Client does not exist');
    }
    return dataStorage.get(name);
};

const getActionConfigs = () => {
    const actionConfigs = [];
    dataStorage.forEach((config, name) => {
        if (config.actions !== undefined) {
            actionConfigs.push({ name, actions: config.actions });
        }
    });
    return actionConfigs;
};

const heartbeat = () => {
    dataStorage.forEach((config, name) => {
        request.get(`http://${config.host}:${config.port}/ping`, (err, response) => {
            if (err) {
                console.log('Could not reach client');
                return;
            }
            config.lastSeen = new Date().toISOString();
        });
    });
};

setInterval(heartbeat, heartbeatInterval);

module.exports = {
    add,
    get,
    getActionConfigs
};
