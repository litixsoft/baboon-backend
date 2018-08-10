'use strict';

var db = require('../lxMongoDb');

/**
 * Create connections to mongoDb
 *
 * @param options
 * @param next
 */
module.exports = function (options, next) {

    // Check server parameter
    if (!options.config) {
        throw new Error('Parameter options.config required');
    }

    var debug = require('debug')('baboon:lxMongoDb');
    debug('Create lxMongoDb connections');
    options.db = db;

    // Connect to databases
    db.connect(options.config.LX_MONGODB);

    // Exit when databases connect error
    db.on('connect_error', function (err) {
        throw err;
    });

    // Init and start application after successfully connect
    db.once('connect', function () {

        next();
    });
};
