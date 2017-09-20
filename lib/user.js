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
        console.log('\n\n\nClient missing trustedUserGroups config and can be never reached\n\n\n');
        return false;
    } else if (trustedUserGroups === 'all') {
        return true;
    } else {
        const userId = Context.getUser(context);
        const user = userStash[userId];
        return Object.keys(trustedUserGroups).find(groupType => {
            // Allow if in any group with a certain type (Trust the whole client)
            if (trustedUserGroups[groupType] === 'all' &&
                user.groups !== undefined &&
                user.groups[groupType].length > 0) {
                console.log('Allowing access for all in', groupType);
                return true;
            }

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
    group.users.forEach(userName => {
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
