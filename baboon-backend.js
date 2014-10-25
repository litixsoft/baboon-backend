#!/usr/bin/env node
/*eslint new-cap:0 */

'use strict';

// Environment default settings
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 3000;
process.env.HOST = process.env.HOST || '127.0.0.1';

var baboon = require('./lib');
var debug = require('debug')('baboon');
var options = {};

// Add errors
options.errors = baboon.lxErrors;

debug('Load configuration');

// Config
var config = new baboon.LxConfig(__dirname);
options.config = config;

var events = require('events');
var eventEmitter = new events.EventEmitter();

debug('Start project application config');

// load application Modules
baboon.LxLoader(options, function (err, options) {

    // check errors and start server
    if (!err) {
        debug('application modules loaded');

        // start server
        var server = options.server;

        server.listen(options.config.PORT, options.config.HOST, function () {
            debug('Express server listening on port ' + server.address().port);

            // Events for regression tests
            eventEmitter.emit('server_started');

            eventEmitter.on('server_stop', function(){
                server._connections = 0;
                server.close(function () {
                    eventEmitter.emit('server_stopped');
                });
            });
        });
    } else {
        throw new Error(err);
    }
});

exports.eventEmitter = eventEmitter;
