const request = require('request');


const heartbeatInterval = 1000 * 60;

const dataStorage = new Map();

const add = (name, client) => {
    if (dataStorage.has(name)) {
        throw new Error('Trying to register duplicate client');
    }
    dataStorage.set(name, client);
    console.log(`${name} registered!`);
};

const get = name => {
    if (!dataStorage.has(name)) {
        throw new Error('Client does not exist');
    }
    return dataStorage.get(name);
};

const heartbeat = () => {
    dataStorage.forEach((config, name) => {
        console.log('Pinging client');
        request.get(`http://${config.host}:${config.port}/ping`, (err, response) => {
            if (err) {
                console.log('Could not reach client');
                return;
            }
            config.lastSeen = new Date().toISOString();
            console.log('Got response from client', response.body);
        });
    });
};

setInterval(heartbeat, heartbeatInterval);

module.exports = {
    add,
    get
};
