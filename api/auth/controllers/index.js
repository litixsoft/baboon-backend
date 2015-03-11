'use strict';

var path = require('path');
var val = require('lx-valid');
var async = require('async');

/**
 * Index controller
 *
 * @returns {{}}
 */
module.exports = function (injects) {
    var db = injects.db;
    var auth = injects.auth;
    var crypto = injects.crypto;
    var mail = injects.mail;
    var config = injects.config;
    var errors = injects.errors;

    var self = {};

    var usersRepo = db.connection('bbTest').collection('users');
    var repo = require('../repositories')(usersRepo, db);
    var rolesRepo = db.connection('bbTest').collection('roles');

    /**
     * Return the difference between two date values
     *
     * @param a
     * @param b
     * @returns {number}
     */
    function dateDiffInDays (a, b) {
        var _MS_PER_DAY = 1000 * 60 * 60 * 24;

        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc1 - utc2) / _MS_PER_DAY);
    }

    /**
     * Create a user
     *
     * @param user
     * @param pwd
     * @param next
     */
    function createUser (user, pwd, next) {
        // create password hash with random salt
        crypto.hashWithRandomSalt(pwd, function (error, result) {
            user.password = result.password;
            user.password_salt = result.salt;

            // create token for activation
            crypto.randomBytes(48, function (error, buffer) {
                user.token = buffer.toString('hex');

                // save user in db
                usersRepo.insert(user, next);
            });
        });
    }

    /**
     * Send mail to user
     *
     * @param options
     * @param next
     */
    function sendMailToUser (options, next) {
        options = options || {};
        var url = options.url + '/' + options.user.token;  // for register
        var message = {from: config.MAIL.senderAddress, to: options.user.email, subject: options.messageSubject};
        var file = options.file;

        var replaceValues = [
            {key: '{LASTNAME}', value: options.user.lastname},
            {key: '{FIRSTNAME}', value: options.user.firstname},
            {key: '{EMAIL}', value: options.user.email},
            {key: '{URL}', value: url},
            {key: '{PASSWORD}', value: options.user.password}
        ];

        mail.sendMailFromTemplate(message, path.join(file, file + '.html'), path.join(file, file + '.txt'), replaceValues, next);
    }

    /**
     * Generate a new password and update the user with it
     *
     * @param data
     * @param next
     */
    function resetPassword (data, next) {
        var err;

        usersRepo.findOne({email: data.email}, {fields: ['_id', 'password', 'salt']}, function (error, userResult) {
            if (error || !userResult) {
                err = new Error('No user found in db');
                err.status = 404;
                return next(err);
            }

            crypto.randomString(6, function (error, randomString) {
                crypto.hashWithRandomSalt(randomString, function (error, result) {
                    usersRepo.update({_id: userResult._id}, {
                        $set: {
                            password: result.password,
                            password_salt: result.salt
                        }
                    }, function (error) {
                        next(error, randomString);
                    });
                });
            });
        });
    }

    /**
     * Login
     *
     * @roles Guest
     * @param req
     * @param res
     * @param next
     */
    self.login = function index (req, res, next) {
        if (!req.body || !req.body.email || !req.body.password) {
            return next(new errors.BadRequestError('Missing req.body'));
        }

        if (!auth) {
            return next(new errors.BadRequestError('Auth not available.'));
        }

        var email = req.body.email.trim();
        var password = req.body.password.trim();

        usersRepo.find({email: email}, {
            fields: {
                _id: 1,
                email: 1,
                password: 1,
                password_salt: 1,
                roles: 1,
                rights: 1,
                is_active: 1
            }
        }).toArray(function (err, success) {
            if (err) {
                return next(err);
            }

            if (success && success.length > 0) {
                var user = success[0];

                if (!user.is_active) {
                    return next(new errors.AccessError('Login Failed, account is inactive'));
                }

                // check password
                crypto.compare(password, user.password, user.password_salt, function (error, result) {
                    if (!error && result) {
                        if (result.is_equal) {
                            // delete hash, salt and is_active from user
                            delete user.password;
                            delete user.password_salt;
                            delete user.is_active;

                            auth.createToken(user.email, user, function (error, result) {
                                // send web token to client
                                return res.status(200).json(result);
                            });
                        } else {
                            return next(new errors.AccessError());
                        }
                    } else {
                        return next(new errors.AccessError('Login Failed, unknown error in compare password'));
                    }
                });
            } else {
                return next(new errors.AccessError('User not found: ' + email));
            }
        });
    };

    /**
     * Register
     *
     * @roles Guest
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    self.register = function index (req, res, next) {
        if (!req.body) {
            return next(new errors.BadRequestError('Missing req.body'));
        }

        if (!auth) {
            return next(new errors.BadRequestError('Auth not available.'));
        }

        var confirmationUrl = req.body.confirmationUrl;

        async.auto({
            getPublicRole: function (next) {
                rolesRepo.findOne({name: config.PUBLIC_USER_ROLE}, next);
            },
            validateUser: ['getPublicRole', function (next, results) {
                repo.user.validate(req.body, function (error, result) {
                    if (error) {
                        return next(new errors.BadRequestError('Unknown validation error by users.register'));
                    }

                    if (result.valid) {
                        var user = {
                            lastname: req.body.lastName,
                            firstname: req.body.firstName,
                            email: req.body.email,
                            is_active: false,
                            register_date: new Date(),
                            roles: [results.getPublicRole._id],
                            rights: []
                        };
                        next(null, user);
                    } else {
                        // throw validation error because user object is not valid
                        return next(new errors.ValidationError(result.errors));
                    }
                });
            }],
            createUser: ['validateUser', function (next, results) {
                createUser(results.validateUser, req.body.password, function (error, result) {
                    if (!result) {
                        return next(error || new errors.BadRequestError('Unknown db error by users.register'));
                    }

                    next(null, result[0]);
                });
            }],
            sendMailToUser: ['createUser', function (next, results) {
                var options = {
                    user: results.createUser,
                    url: confirmationUrl,
                    messageSubject: 'Register',
                    file: 'register'
                };

                sendMailToUser(options, function (error) {
                    if (error) {
                        return next(new errors.BadRequestError('Could not send email'));
                    }

                    res.status(200).json({success: true});
                    next();
                });
            }]
        }, next);
    };

    /**
     * confirmRegister
     *
     * @roles Guest
     * @param req
     * @param res
     * @param next
     */
    self.confirmRegister = function index (req, res, next) {
        var err;

        // get user with token from req
        usersRepo.findOne({token: req.params.id}, {fields: ['_id', 'register_date', 'is_active']}, function (error, result) {
            if (error) {
                return next(new errors.BadRequestError('Unknown db error by users.confirm'));
            }

            if (!result) {
                err = new Error('No user found in db');
                err.status = 404;
                return next(err);
            }

            // check if period of confirmation is expired
            if (dateDiffInDays(new Date(), result.register_date) > config.CONFIRMATION_EXPIRED_IN_DAYS) {
                err = new Error('The period of the confirmation has expired.');
                err.status = 409;
                next(err);
            } else {
                usersRepo.update(
                    {_id: result._id},
                    {
                        $set: {is_active: true},
                        $unset: {token: 1}
                    },
                    {multi: false},
                    function (error, updateResult) {
                        if (error || !updateResult) {
                            return next(new errors.BadRequestError('Unknown db error by users.confirm'));
                        }

                        res.status(200).json({success: true});
                    });
            }

        });
    };

    /**
     * renewConfirmationMail
     *
     * @roles Guest
     * @param req
     * @param res
     * @param next
     */
    self.renewConfirmationMail = function index (req, res, next) {
        if (!req.body) {
            return next(new errors.BadRequestError('Missing req.body'));
        }

        usersRepo.findAndModify(
            {token: req.body.id},                   // query
            {},                                     // sort
            {$set: {register_date: new Date()}},    // update
            {new: true},                            // return new result
            function (error, result) {
                if (error) {
                    return next(error || new errors.BadRequestError('Unknown db error by users.confirm'));
                }

                var options = {
                    user: result,
                    url: req.body.url,
                    messageSubject: 'Register',
                    file: 'register'
                };

                sendMailToUser(options, function (error) {
                    if (error) {
                        return next(error || new errors.BadRequestError('Could not send mail'));
                    }

                    res.status(200).json({success: true});
                });
            }
        );
    };

    /**
     * ResetPassword
     *
     * @roles Guest
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    self.resetPassword = function index (req, res, next) {
        if (!req.body) {
            return next(new errors.BadRequestError('Missing req.body'));
        }

        if (!auth) {
            return next(new errors.BadRequestError('Auth not available.'));
        }

        // check if email is valid
        var isValidMail = val.formats.email(req.body.email);
        if (!isValidMail.valid) {
            //throw validation error
            var error = [
                {
                    attribute: 'format',
                    property: 'email',
                    message: 'is not a valid email'
                }
            ];

            return next(new errors.ValidationError(error));
        }

        resetPassword(req.body, function (error, result) {
            if (error) {
                // throw error while trying to save the new user
                return next(error || new errors.BadRequestError('Unknown db error by users.resetPassword'));
            }

            var options = {
                user: {email: req.body.email, password: result},
                messageSubject: 'Your new password',
                file: 'password'
            };

            sendMailToUser(options, function (error) {
                if (error) {
                    return next(error || new errors.BadRequestError('Could not send mail'));
                }

                res.status(200).json({success: true});
            });
        });
    };

    /**
     * Logout
     *
     * @roles User
     * @param req
     * @param res
     * @param next
     */
    self.logout = function (req, res, next) {
        auth.removeToken(req.headers['x-access-token'], function (error, result) {
            if (error) {
                return next(new errors.BadRequestError('Logout Failed'));
            }

            if (result && result.result.n > 0) {
                res.status(200).json({success: true});
            } else {
                next(new errors.DataOperationError('Logout Failed', req.headers['x-access-token'], 'token', result));
            }
        });
    };

    return self;
};
