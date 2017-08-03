const request = require('request');
const fs = require('fs');
const heartbeatInterval = 1000 * 10;

const persistenceFile = 'clientData.json';

let dataStorage = new Map();

const savePool = () => {
    const str = JSON.stringify(Array.from(dataStorage), null, 2);
    console.log('Persisting client configs');
    fs.writeFile(persistenceFile, str, err => {
        if (err) {
            console.log('Error persisting client pool', err);
        }
    });
};

const loadPool = () => {
    console.log('Loading client pool');
    fs.readFile(persistenceFile, (err, data) => {
        if (err) {
            return;
        }
        dataStorage = new Map(JSON.parse(data.toString()));
    });
};

loadPool();

const add = (name, client) => {
    if (dataStorage.has(name)) {
        console.log(`${name} registered again as a client`);
    }
    client.reachable = true;
    dataStorage.set(name, client);
    console.log(`${name} registered!`);
    console.log(JSON.stringify(client, null, 2));
    savePool();
};

const get = name => {
    if (!dataStorage.has(name)) {
        throw new Error(`Client ${name} does not exist`);
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

const getCommandClients = () => {
    const actionConfigs = [];
    dataStorage.forEach((config, name) => {
        if (config.commands !== undefined) {
            config.commands.forEach(cmd => actionConfigs.push({ name, command: cmd }));
        }
    });
    return actionConfigs;
};

const heartbeat = () => {
    dataStorage.forEach((config, name) => {
        request.get(`http://${config.host}:${config.port}/ping`, (err, response) => {
            if (err) {
                console.log(`Client ${name} did not respond to heartbeat`);
                config.reachable = false;
                return;
            }
            config.lastSeen = new Date().toISOString();
            if (config.reachable === false) {
                console.log(`Reached the client ${name} again`);
                config.reachable = true;
            }
        });
    });
};

const getAllClients = () => {
    const clients = {};
    dataStorage.forEach((client, name) => clients[name] = client);
    return clients;
}

setInterval(heartbeat, heartbeatInterval);

module.exports = {
    add,
    get,
    getActionConfigs,
    getCommandClients,
    getAllClients
};
