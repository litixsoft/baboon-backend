'use strict';

var path = require('path');
var _ = require('lodash');

/**
 * Application configuration
 *
 * @param rootPath
 * @returns {{}}
 */
module.exports = function (rootPath) {
    var self = {};
    var debug = require('debug')('baboon:LxConfig');
    var pkg = require(path.join(rootPath, 'package.json'));

    // Vars
    self.NAME = pkg.name;
    self.VERSION = pkg.version;

    // Paths
    self.ROOT_PATH = rootPath;
    self.API_PATH = path.join(rootPath, 'api');
    self.CONFIG_PATH = path.join(rootPath, 'config');
    self.SERVER_PATH = path.join(rootPath, 'server');

    // Environment
    self.NODE_ENV = process.env.NODE_ENV;
    self.PORT = process.env.PORT;
    self.HOST = process.env.HOST;
    self.CONFIG_NAME = process.env.CONFIG;
    self.PROTOCOL = process.env.PROTOCOL;

    var baseConfig = require(path.join(self.CONFIG_PATH, 'base'));
    debug('Configuration load:', self.CONFIG_NAME || self.NODE_ENV);

    var configFilename = path.join(self.CONFIG_PATH, self.CONFIG_NAME || self.NODE_ENV);
    var avc = {};
    try {
        avc = require(configFilename) || {};
    } catch (err) {
        if (err && err.code === 'MODULE_NOT_FOUND') {
            debug('Configuration File "\u001b[33m%s\u001b[0m" \u001b[31mnot found\u001b[0m. Skipped.', configFilename || '');
        } else {
            throw new Error(err);
        }
    }

    var config = _.merge(baseConfig, avc);
    self = _.merge(config, self);

    // check if protocol is valid, fallback to http
    if (self.PROTOCOL !== 'http' && self.PROTOCOL !== 'https') {
        debug('Wrong protocol: %s! Only http or https allowed', self.PROTOCOL);
        debug('http used as fallback');

        self.PROTOCOL = 'http';
    }

    debug('Configuration loaded:', self);

    return self;
};
