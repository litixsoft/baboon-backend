'use strict';

/**
 *
 * @param router
 * @param controller
 * @param middleware
 * @param socketRouter
 */
module.exports = function (router, controller, middleware, socketRouter) {

    // Register main index route
    router.get('/', controller.get('/main/index').index);

    // Register auth routes
    router.post('/auth/account/login', controller.get('/auth/index').login);
    router.get('/auth/account/confirmation/:id', controller.get('/auth/index').confirmRegister);
    router.post('/auth/account/renew', controller.get('/auth/index').renewConfirmationMail);
    router.post('/auth/account/register', controller.get('/auth/index').register);
    router.post('/auth/account/password', controller.get('/auth/index').resetPassword);

    // Register main routes
    router.get('/awesomeThings', middleware.auth, controller.get('/main/index').awesomeThings);

    // Register main sockets
    socketRouter.on('awesomeThings', controller.get('/main/index').socket_awesomeThings);

    // Register users routes
    router.get('/users', middleware.auth, controller.get('/main/users').getAll);
    router.get('/users/:id', middleware.auth, controller.get('/main/users').getById);
};
