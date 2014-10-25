'use strict';

var _ = require('lodash');
var debug = require('debug')('lxRouter');

/**
 * Mapper for controller routing over rest and socket
 *
 * @param options
 * @returns {{}}
 * @constructor
 */
module.exports = function (options) {

    // Check the type of options
    if (!_.isObject(options)) {
        throw new TypeError('Parameter options required and must be type object');
    }

    // Check the type of options.config
    if (!_.isObject(options.config)) {
        throw new TypeError('Parameter options.config required and must be type options');
    }

    // Default properties
    var self = {};
    var socketEvents = {};

    function init (socket, socketAcl) {
        var found = true;

        _.forIn(socketEvents, function (action, eventName) {
            if (socketAcl) {
                found = _.find(socketAcl, function (right) {
                    return eventName === right.route;
                });
            }

            if (found) {
                debug('Register socket event: %s with action: %s', eventName, action.name);

                socket.on(eventName, function (data, callback) {
                    action(data, socket, callback);
                });
            }
        });
    }

    /**
     * Register socket events
     *
     * @param socket
     */
    self.registerSocketEvents = function (socket) {
        if (options.auth) {
            if (socket.handshake.query.token && socket.handshake.query.token !== 'undefined') {
                // authenticated user
                options.auth.checkToken(socket.handshake.query.token, function (err, user) {
                    if (err) {
                        debug(err);
                    }

                    if (user) {
                        init(socket, user.sockets);
                    }
                });
            } else if (options.db) {
                // public user role
                options.auth.getRightsByRole(options.config.PUBLIC_USER_ROLE, function (err, res) {
                    if (err) {
                        debug(err);
                    }

                    init(socket, res.socket);
                });
            }
        } else {
            // right system disabled
            init(socket);
        }
    };

    /**
     * Save socket event for later register
     *
     * @param {string} eventName - The name of socket.on event
     * @param {function} action - The action method for event
     */
    self.on = function on (eventName, action) {

        // Check the type of eventName
        if (!_.isString(eventName)) {
            throw new TypeError('Parameter eventName is required and must be type string.');
        }

        // Check the type of action
        if (!_.isFunction(action)) {
            throw new TypeError('Parameter action is required and must be type action.');
        }

        // Save socket Event for register
        debug('Save socket event: %s -> %s for register', eventName, action.name);
        socketEvents[eventName] = action;
    };

    return self;
};
