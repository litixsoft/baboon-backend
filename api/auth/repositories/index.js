'use strict';

module.exports = function (connection, db) {
    var userRepo = require('./usersRepository')(connection, db);

    return {
        user: userRepo
    };
};

