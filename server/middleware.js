'use strict';
/*eslint no-unused-vars:0 */

var _ = require('lodash');

/**
 * Middleware
 * @param options
 * @returns {{}}
 */
module.exports = function (options) {

    var self = {};

    self.allRequests = function (req, res, next) {
        // Set content type
        res.set('Content-Type', 'application/json');

        // Check API key is in keys list
        var apiKey = req.headers['x-access-apikey'];
        var found = _.find(options.config.API_KEYS, function (obj) {
            return obj.key === apiKey;
        });

        if (!found) {
            next(new options.errors.AuthError());
        } else {
            next();
        }
    };

    self.auth = function (req, res, next) {
        // If options.auth is false
        if (!options.auth) {
            return next();
        }

        if (!req.headers['x-access-token']) {
            return next(new options.errors.AuthError());
        }

        var token = req.headers['x-access-token'];
        options.auth.checkToken(token, function (err, user) {
            if (err) {
                return next(err);
            }

            req.user = user;
            var hasAccess = options.auth.checkAccessToRoute(req.route.path, user.acl);

            if (hasAccess) {
                next();
            } else {
                next(new options.errors.AccessError());
            }
        });
    };

    self.errorHandler = function (err, req, res, next) {
        var status = 500;
        var message = 'Internal server error';

        if (!err.status) {
            err.status = status;
            err.message = message;
        }

        // Check server mode
        if (options.config.NODE_ENV === 'development' || options.config.NODE_ENV === 'test') {

            // Return complete error
            res.status(err.status).json(err);

        } else {

            // Production mode, delete the stack
            err.stack = null;
            res.status(err.status).json(err);
        }
    };

    return self;
};
