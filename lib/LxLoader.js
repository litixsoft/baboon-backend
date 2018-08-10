'use strict';

var path = require('path');
var _ = require('lodash');
var async = require('async');

/**
 * Load the application modules
 *
 * @param options
 * @param callback
 */
module.exports = function (options, callback) {

    var debug = require('debug')('baboon:LxLoader');
    var syncTasks = [];

    debug('Prepare startup');
    debug('Add startup tasks');

    _.forIn(options.config.STARTUP, function (value, key) {

        // Check value and push to task array
        if (value) {
            debug('add module ' + key + ' to startup tasks');
            syncTasks.push(function (cbTasks) {
                require(path.join(options.config.SERVER_PATH, 'start.d', key))(options, cbTasks);
            });
        }
    });

    debug('run all startup tasks with async series');
    async.series(syncTasks, function (err) {

        if (!err) {
            callback(null, options);
        } else {
            callback(err);
        }
    });
};
