const _ = require('lodash');
const fs = require('fs');

let userStash = {};

const Context = require('./contextUtil');

const persistenceFile = 'users.json';

const saveStash = () => {
    const str = JSON.stringify(userStash, null, 2);
    fs.writeFile(persistenceFile, str, err => {
        if (err) {
            console.log('Error persisting user stash', err);
        }
    });
};

const loadStash = () => {
    fs.readFile(persistenceFile, (err, data) => {
        if (err) {
            return;
        }
        userStash = JSON.parse(data.toString());
    });
};

loadStash();

const initUser = (userName, properties) => {
    userStash[userName] = {
        userName: userName,
        groups: {},
        properties: properties || {}
    };
    saveStash();
    return userStash[userName];
};

const isTrustedUser = (context, trustedUserGroups) => {
    // If no trusted groups listed, treat everyone trusted
    if (trustedUserGroups === undefined) {
        return true;
    } else {
        const userId = Context.getUser(context);
        const user = userStash[userId];
        return Object.keys(trustedUserGroups).find(groupType => {
            if (user.groups === undefined || user.groups[groupType] === undefined) {
                return false;
            }
            return user.groups[groupType].find(group => {
                if (trustedUserGroups[groupType].indexOf(group) !== -1) {
                    return true;
                }
            })
        });
    }
};

const setGroupForUsers = group => {
    const groupId = group.group;
    const groupType = group.type;
    Object.keys(group.users).forEach(userName => {
        let existingUser = userStash[userName];
        if (existingUser === undefined) {
            existingUser = initUser(userName);
        }
        if (existingUser.groups[groupType] === undefined) {
            existingUser.groups[groupType] = [];
        }
        if (existingUser.groups[groupType].indexOf(groupId) === -1) {
            existingUser.groups[groupType].push(groupId);
        }
    });
    saveStash();
};

const refreshUser = ctx => {
    const userId = Context.getUser(ctx);
    const userProperties = Context.getUserProperties(ctx);
    const existingUser = userStash[userId];

    // Create user if it doesn't exist
    if (existingUser === undefined) {
        initUser(userId, userProperties);
    } else {
        Object.assign(existingUser.properties, userProperties);
    }
    saveStash();
};

const getUserProperties = ctx => {
    const userId = Context.getUser(ctx);
    const userData = userStash[userId];
    if (userData) {
        return _.get(userData, 'properties', {});
    }
};

module.exports = {
    setGroupForUsers,
    isTrustedUser,
    refreshUser,
    getUserProperties
};
