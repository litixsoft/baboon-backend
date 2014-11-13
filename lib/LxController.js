'use strict';

var _ = require('lodash');

/**
 *
 * @returns {{}}
 */
module.exports = function (apiPath, injects) {
    var self = {};
    var appController = {};

    var debug = require('debug')('baboon:LxController');
    debug('Start LxController');

    var controllerFiles = '/**/controllers/*.js';
    var grunt = require('grunt');

    // modules
    var patternControllers = apiPath + controllerFiles;
    var controllers = grunt.file.expand(patternControllers);
    var result = {};

    /**
     * Helper for build controller path
     *
     * @param fullPathToControllerFile
     * @param separator
     * @param controllerDirectory
     * @returns {*}
     */
    function getControllerPath (fullPathToControllerFile, separator, controllerDirectory) {
        var modulePath = '';
        var splittedFile = fullPathToControllerFile.split(separator);

        // get controller name and remove '.js' from file name
        var controllerName = splittedFile.pop().slice(0, -3);

        // remove controllerName
        splittedFile.pop();

        var moduleName = splittedFile.pop();
        var i = splittedFile.length - 1;

        if (splittedFile.indexOf(controllerDirectory) === -1) {
            // no modulename found, therefore modulename = controllerDirectory and
            // controllerDirectory not anymore in splittedFile
            return null;
        }

        while (splittedFile[i] !== controllerDirectory) {
            modulePath = splittedFile[i] + '/' + modulePath;
            i--;
        }

        return modulePath + moduleName + '/' + controllerName;
    }

    /**
     * Get a controller with given name
     *
     * @param controllerName
     * @returns {*}
     */
    self.get = function getController (controllerName) {

        if (!_.isString(controllerName)) {
            throw new TypeError('Parameter controllerName must be a string.');
        }

        if (!appController.hasOwnProperty(controllerName)) {
            throw new Error('Controller: ' + controllerName + ' not found.');
        } else {
            return appController[controllerName];
        }
    };

    /**
     * Create appController object
     */
    function createAppController () {

        _(controllers).forEach(function (controllerFile) {
            // get controller path, e.g. app/blog/blog
            var controllerPath = getControllerPath(controllerFile, '/', 'api');

            if (controllerPath) {
                debug('Init controller: %s', controllerFile);

                // init controller and store in result
                try {
                    result['/' + controllerPath] = require(controllerFile)(injects);
                } catch (e) {
                    console.log('baboon:LxController Error loading controller: ' + controllerFile);
                    console.log(e);
                }
            }
        });

        appController = result;
    }

    createAppController();
    return self;
};
