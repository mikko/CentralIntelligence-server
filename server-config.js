const fs = require('fs');

module.exports = {
    port: 3000,
    internalClientPort: 3001,
    authKey: process.env.AUTH_KEY || fs.readFileSync('/run/secrets/authkey', { encoding: 'utf-8' }).trim()
};
