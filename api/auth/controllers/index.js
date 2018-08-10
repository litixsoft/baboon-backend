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
    function dateDiffInDays(a, b) {
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
    function createUser(user, pwd, next) {
        if (!user || !pwd) {
            return next(new Error('invalid user or pwd object'));
        }

        async.auto({
            hashWithRandomSalt: function (cb) {
                crypto.hashWithRandomSalt(pwd, cb);
            },
            randomBytes: function (cb) {
                crypto.randomBytes(48, cb);
            },
            insertUser: ['hashWithRandomSalt', 'randomBytes', function (res, cb) {
                user.password = res.hashWithRandomSalt.password;
                user.password_salt = res.hashWithRandomSalt.salt;
                user.token = res.randomBytes.toString('hex');

                // save user in db
                usersRepo.insertOne(user, cb);
            }]
        }, function (err, res) {
            if (err) {
                return next(err);
            }

            next(null, res);
        });
    }

    /**
     * Send mail to user
     *
     * @param options
     * @param next
     */
    function sendMailToUser(options, next) {
        options = options || {};
        var url = options.url + '/' + options.user.token;  // for register
        var message = { from: config.MAIL.senderAddress, to: options.user.email, subject: options.messageSubject };
        var file = options.file;

        var replaceValues = [
            { key: '{LASTNAME}', value: options.user.lastname },
            { key: '{FIRSTNAME}', value: options.user.firstname },
            { key: '{EMAIL}', value: options.user.email },
            { key: '{URL}', value: url },
            { key: '{PASSWORD}', value: options.user.password }
        ];

        mail.sendMailFromTemplate(message, path.join(file, file + '.html'), path.join(file, file + '.txt'), replaceValues, next);
    }

    /**
     * Generate a new password and update the user with it
     *
     * @param data
     * @param next
     */
    function resetPassword(data, next) {
        async.auto({
                getUser: function (cbAsync) {
                    usersRepo.findOne({ email: data.email }, { fields: ['_id', 'password', 'salt'] }, function (errFind, resUser) {
                        if (errFind || !resUser) {
                            var err = new Error('No user found in db');
                            err.status = 404;

                            return cbAsync(err);
                        }

                        return cbAsync(null, resUser);
                    });
                },
                randString: ['getUser', function (cbAsync) {
                    crypto.randomString(6, cbAsync);
                }],
                hashPassword: ['getUser', 'randString', function (resAsync, cbAsync) {
                    crypto.hashWithRandomSalt(resAsync.randString, cbAsync);
                }],
                updateUser: ['hashPassword', function (resAsync, cbAsync) {
                    usersRepo.updateOne({ _id: resAsync.getUser._id }, {
                        $set: {
                            password: resAsync.hashPassword.password,
                            password_salt: resAsync.hashPassword.salt
                        }
                    }, cbAsync);
                }]
            },
            function (err, res) {
                if (err) {
                    return next(err);
                }

                next(null, res.randString);
            }
        );
    }

    /**
     * Login
     *
     * @roles Guest
     * @param req
     * @param res
     * @param next
     */
    self.login = function index(req, res, next) {
        if (!req.body || !req.body.email || !req.body.password) {
            return next(new errors.BadRequestError('Missing req.body'));
        }

        if (!auth) {
            return next(new errors.BadRequestError('Auth not available.'));
        }

        var email = req.body.email.trim();
        var password = req.body.password.trim();

        usersRepo.findOne({ email: email }, {
            fields: {
                _id: 1,
                email: 1,
                password: 1,
                password_salt: 1,
                roles: 1,
                rights: 1,
                is_active: 1
            }
        }, function (errFind, user) {
            if (errFind) {
                return next(errFind);
            }

            if (!user) {
                return next(new errors.AccessError('User not found: ' + email));
            }

            if (!user.is_active) {
                return next(new errors.AccessError('Login Failed, account is inactive'));
            }

            // check password
            crypto.compare(password, user.password, user.password_salt, function (errCompare, result) {
                if (errCompare || !result || !result.is_equal) {
                    return next(new errors.AccessError('Login Failed, unknown error in compare password'));

                }

                // delete hash, salt and is_active from user
                delete user.password;
                delete user.password_salt;
                delete user.is_active;

                auth.createToken(user.email, user, function (errToken, resToken) {
                    if (errToken) {
                        return next(new errors.AccessError());
                    }

                    // send web token to client
                    return res.status(200).json(resToken);
                });
            });
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
    self.register = function index(req, res, next) {
        if (!req.body) {
            return next(new errors.BadRequestError('Missing req.body'));
        }

        if (!auth) {
            return next(new errors.BadRequestError('Auth not available.'));
        }

        var confirmationUrl = req.body.confirmationUrl;

        async.auto({
            getPublicRole: function (cbAsync) {
                rolesRepo.findOne({ name: config.PUBLIC_USER_ROLE }, cbAsync);
            },
            validateUser: ['getPublicRole', function (resAsync, cbAsync) {
                repo.user.validate(req.body, function (error, validateResults) {
                    if (error) {
                        return cbAsync(new errors.BadRequestError('Unknown validation error by users.register'));
                    }

                    if (validateResults.valid) {
                        var user = {
                            lastname: req.body.lastName,
                            firstname: req.body.firstName,
                            email: req.body.email,
                            is_active: false,
                            register_date: new Date(),
                            roles: [resAsync.getPublicRole._id],
                            rights: []
                        };

                        return cbAsync(null, user);
                    }

                    // throw validation error because user object is not valid
                    return cbAsync(new errors.ValidationError(validateResults.errors));
                });
            }],
            createUser: ['validateUser', function (resAsync, cbAsync) {
                createUser(resAsync.validateUser, req.body.password, function (error, result) {
                    if (error || !result) {
                        return cbAsync(error || new errors.BadRequestError('Unknown db error by users.register'));
                    }

                    cbAsync(null, result[0]);
                });
            }],
            sendMailToUser: ['createUser', function (resAsync, cbAsync) {
                var options = {
                    user: resAsync.createUser,
                    url: confirmationUrl,
                    messageSubject: 'Register',
                    file: 'register'
                };

                sendMailToUser(options, function (error) {
                    if (error) {
                        return cbAsync(new errors.BadRequestError('Could not send email'));
                    }

                    res.status(200).json({ success: true });
                    cbAsync();
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
    self.confirmRegister = function index(req, res, next) {
        if (!req.params || !req.params.id) {
            return next(new errors.BadRequestError('Missing req.param'));
        }

        // get user with token from req
        usersRepo.findOne({ token: req.params.id }, { fields: ['_id', 'register_date', 'is_active'] }, function (errFind, resFind) {
            if (errFind) {
                return next(new errors.BadRequestError('Unknown db error by users.confirm'));
            }

            var err;

            if (!resFind) {
                err = new Error('No user found in db');
                err.status = 404;
                return next(err);
            }

            // check if period of confirmation is expired
            if (dateDiffInDays(new Date(), resFind.register_date) > config.CONFIRMATION_EXPIRED_IN_DAYS) {
                err = new Error('The period of the confirmation has expired.');
                err.status = 409;
                return next(err);
            }

            usersRepo.updateOne(
                { _id: resFind._id },
                {
                    $set: { is_active: true },
                    $unset: { token: 1 }
                },
                function (errUpdate, updateResult) {
                    if (errUpdate || !updateResult) {
                        return next(new errors.BadRequestError('Unknown db error by users.confirm'));
                    }

                    res.status(200).json({ success: true });
                });
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
    self.renewConfirmationMail = function index(req, res, next) {
        if (!req.body) {
            return next(new errors.BadRequestError('Missing req.body'));
        }

        usersRepo.findOneAndUpdate(
            { token: req.body.id },                     // query
            { $set: { register_date: new Date() } },    // update
            { returnOriginal: false },                  // return new result
            function (errFindUpdate, result) {
                if (errFindUpdate) {
                    return next(errFindUpdate || new errors.BadRequestError('Unknown db error by users.confirm'));
                }

                var options = {
                    user: result,
                    url: req.body.url,
                    messageSubject: 'Register',
                    file: 'register'
                };

                sendMailToUser(options, function (errMailSender) {
                    if (errMailSender) {
                        return next(errMailSender || new errors.BadRequestError('Could not send mail'));
                    }

                    res.status(200).json({ success: true });
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
    self.resetPassword = function index(req, res, next) {
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

        resetPassword(req.body, function (errPasswordReset, result) {
            if (errPasswordReset) {
                // throw error while trying to save the new user
                return next(errPasswordReset || new errors.BadRequestError('Unknown db error by users.resetPassword'));
            }

            var options = {
                user: { email: req.body.email, password: result },
                messageSubject: 'Your new password',
                file: 'password'
            };

            sendMailToUser(options, function (errMailSender) {
                if (errMailSender) {
                    return next(errMailSender || new errors.BadRequestError('Could not send mail'));
                }

                res.status(200).json({ success: true });
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
                res.status(200).json({ success: true });
            } else {
                next(new errors.DataOperationError('Logout Failed', req.headers['x-access-token'], 'token', result));
            }
        });
    };

    return self;
};
