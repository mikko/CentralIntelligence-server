const Joi = require('joi');
const Hapi = require('hapi');
const handlers = require('./lib/handlers');
const serverConfig = require('./server-config');
const internalClientServer = require('./lib/internalClientServer');
const auth = require('./lib/auth');

let serverOptions = {};

const server = new Hapi.Server(serverOptions);

const port = serverConfig.port;

auth.setAuthKey(serverConfig.authKey);

const routes = [
    {
        method: 'GET',
        path: `/alive`,
        config: {
            handler: (req, reply) => reply('Alive')
        }
    },
    {
        method: 'POST',
        path: `/register`,
        config: {
            handler: handlers.register,
            validate: {
                payload: {
                    name: Joi.string().required(),
                    host: Joi.string().required(),
                    port: Joi.number().required(),
                    actions: Joi.object(),
                    commands: Joi.array(),
                    authKey: Joi.string(),
                    trustedUserGroups: Joi.alternatives().try(Joi.object(), Joi.string())
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/message`,
        config: {
            handler: handlers.message,
            validate: {
                payload: {
                    message: Joi.string().required(),
                    context: Joi.object().required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/reply`,
        config: {
            handler: handlers.reply,
            validate: {
                payload: {
                    message: Joi.string().required(),
                    context: Joi.object().required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/command`,
        config: {
            handler: handlers.command,
            validate: {
                payload: {
                    command: Joi.string().required(),
                    parameters: Joi.string().allow(''),
                    JSONPayload: Joi.object(),
                    context: Joi.object().required()
                }
            }
        }
    }
];

server.connection({
    port
});

routes.forEach(route => {
    server.route(route);
});

server.start(err => {
    if (err) {
        console.log(err);
        throw err;
    }
    console.log('Central Intelligence running', server.info.uri);

    const commonConfig = {
        serverHost: 'localhost',
        serverPort: serverConfig.port,
        myHost: 'localhost',
        myPort: serverConfig.internalClientPort,
        authKey: serverConfig.authKey
    };

    // Start internal commands and actions
    internalClientServer.start(commonConfig);
});
