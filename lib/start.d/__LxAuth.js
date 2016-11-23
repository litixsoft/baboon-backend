'use strict';

/**
 * Create auth
 *
 * @param options
 * @param next
 */
module.exports = function (options, next) {
    // Check server parameter
    if (!options.config) {
        throw new Error('Parameter options.config required');
    }
    if (!options.db) {
        throw new Error('Parameter options.db required');
    }

    var debug = require('debug')('baboon:LxAuth');
    debug('Create LxAuth');
    var auth = require('../LxAuth')(options);

    options.auth = auth;

    next();
};