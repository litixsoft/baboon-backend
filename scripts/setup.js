#!/usr/bin/env node

'use strict';

var path = require('path');
var baboon = require('../lib');
var config = new baboon.LxConfig(path.join(__dirname, '..'));

var options = {};
options.config = config;

var mongo = require('../lib/start.d/lxMongoDb');
mongo(options, function() {

    var auth = require('../lib/start.d/lxAuth');
    auth(options, function () {

        console.log('Refreshing rights in database..');

        options.auth.refreshRightsInDb(function () {
            options.db.disconnect();

            console.log('Done.');
        });
    });
});
