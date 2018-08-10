'use strict';
/*eslint no-new:0 */

var baboon = require('../../lib/index');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var router = new express.Router();
var Routes = require('./../routes');
var Middleware = require('./../middleware');
var cors = require('cors');
var io;

/**
 * Configure express server application
 *
 * @param options
 * @param next
 */
module.exports = function (options, next) {

    var debug = require('debug')('baboon:app');

    debug('Create express application');

    if (!options.config) {
        throw new TypeError('Missing options.config, required for create express application');
    }

    // Middleware
    var middleware = new Middleware(options);

    // Express application
    var app = express();
    var server;

    // Http server
    if (options.config.PROTOCOL === 'http') {
        server = require('http').createServer(app);
    } else {
        var fs = require('fs');
        var path = require('path');
        var constants = require('constants');
        var serverOptions = {
            key: fs.readFileSync(path.join(process.cwd(), 'server', 'ssl', 'ssl.key')),
            cert: fs.readFileSync(path.join(process.cwd(), 'server', 'ssl', 'ssl.crt')),

            // https://gist.github.com/3rd-Eden/715522f6950044da45d8

            // This is the default secureProtocol used by Node.js, but it might be
            // sane to specify this by default as it's required if you want to
            // remove supported protocols from the list. This protocol supports:
            //
            // - SSLv2, SSLv3, TLSv1, TLSv1.1 and TLSv1.2
            //
            secureProtocol: 'SSLv23_method',

            //
            // Supply `SSL_OP_NO_SSLv3` constant as secureOption to disable SSLv3
            // from the list of supported protocols that SSLv23_method supports.
            //
            secureOptions: constants.SSL_OP_NO_SSLv3 || constants.SSL_OP_NO_SSLv2
        };

        server = require('https').createServer(serverOptions, app);
    }

    // Configure Express
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(methodOverride());
    app.use(cors());
    app.use(logger('dev'));

    // Middleware for all requests
    app.use(middleware.allRequests);

    // Routes
    app.use('/', router);

    // Errors middleware
    app.use(middleware.errorHandler);

    debug('Create injects for the controllers');
    // Add modules to injects
    var injects = {
        config: options.config,
        crypto: new baboon.LxCrypto(),
        mail: new baboon.LxMail(options.config.MAIL)
    };

    // Add db to injects
    if (options.db) {
        injects.db = options.db;
    }

    // Add db to injects
    if (options.errors) {
        injects.errors = options.errors;
    }

    // Add auth to injects
    if (options.auth) {
        injects.auth = options.auth;
    }

    debug('Controller injects:');
    debug(injects);

    debug('Load the controllers from the api path');
    var lxController = new baboon.LxController(options.config.API_PATH, injects);

    // Make lxSocketRouter placeholder object with mock function.
    // When SOCKET_ENABLED true then overwrite this object.
    var lxSocketRouter = {
        on: function () {
        }
    };

    // Check if socket enabled, when enabled create instance
    // of lxSocketRouter and register the connection event
    if (options.config.SOCKET_ENABLED) {

        // Create instance for socket router
        lxSocketRouter = new baboon.LxSocketRouter(options);

        debug('Socket is enabled, start socket.io server');
        io = require('socket.io')(server);

        // When connected register sockets
        io.on('connection', function (socket) {
            lxSocketRouter.registerSocketEvents(socket);
        });
    }

    // Initialize all routes with express router and controller.
    // Register all socket events with lxSocketRouter.
    // If lxSocketRouter is not initialized, is passed the undefined object.
    debug('Initialize routes');
    new Routes(router, lxController, middleware, lxSocketRouter);

    // export server to options
    options.server = server;

    // next callback
    next();
};
