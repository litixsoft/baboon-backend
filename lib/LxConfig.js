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

    var baseConfig = require(path.join(self.CONFIG_PATH, 'base.json'));
    var config = _.merge(baseConfig, require(path.join(self.CONFIG_PATH, self.NODE_ENV + '.json')) || {});
    self = _.merge(config, self);

    debug('Configuration loaded:', self);

    return self;
};
