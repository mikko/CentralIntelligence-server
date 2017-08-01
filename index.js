const Joi = require('joi');
const Hapi = require('hapi');
const handlers = require('./lib/handlers');

let serverOptions = {};

const server = new Hapi.Server(serverOptions);

const port = 3000;


const routes = [
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
                    actions: Joi.object()
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
        throw err;
    }
    console.log('Central Intelligence running', server.info.uri);

});
