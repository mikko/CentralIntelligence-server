let authKey = null;

const setAuthKey = key => {
    if (authKey !== null) {
        throw new Error('authKey cannot be set twice');
    }
    authKey = key;
};

const checkKey = key => {
    return authKey === key;
};

module.exports = {
    setAuthKey,
    checkKey
};
