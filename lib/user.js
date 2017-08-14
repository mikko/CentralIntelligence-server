
const userStash = {};

const Context = require('./contextUtil');

console.log('TODO: persist userStash');

const initUser = userName => {
    userStash[userName] = {
        userName: userName,
        groups: {}
    };
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
    })
};

const refreshUser = ctx => {
    const userId = Context.getUser(ctx);
    const existingUser = userStash[userId];

    // Create user if it doesn't exist
    if (existingUser === undefined) {
        initUser(userId);
    }
    // TODO: implement other user details api on Client
};

module.exports = {
    setGroupForUsers,
    isTrustedUser,
    refreshUser
};
