module.exports = function (collection, db) {
    'use strict';

    var self = {};
    var val = require('lx-valid');

    function schema() {
        return {
            properties: {
                _id: {
                    type: 'string',
                    format: 'mongo-id',
                    key: true
                },
                email: {
                    type: 'string',
                    format: 'email',
                    required: true
                },
                password: {
                    type: 'string',
                    dependencies: 'password2'
                },
                salt: {
                    type: 'string'
                },
                password2: {
                    type: 'string',
                    conform: function (actual, data) {
                        return actual === data.password;
                    },
                    messages: {
                        conform: 'Die Passwörter stimmen nicht überein.'
                    }
                },
                lastName: {
                    type: 'string',
                    required: true,
                    maxLength: 100,
                    minLength: 4
                },
                firstName: {
                    type: 'string',
                    required: true,
                    maxLength: 100,
                    minLength: 4
                },
                is_active: {
                    type: 'boolean'
                },
                register_date: {
                    type: 'string',
                    format: 'date-time'
                }
            }
        };
    }

    var validationFunction = val.getValidationFunction({
        deleteUnknownProperties: true,
        trim: true,
        convert: db.convertDataValuesForSchema
    });

    /**
     * Validation fo duplicate mail.
     *
     * @param {!Object} doc The document.
     * @param {!function({}, {})} callback The callback function.
     */
    self.checkMail = function (doc, callback) {
        if (!doc) {
            callback(null, { valid: true });
            return;
        }

        var query = {
            email: doc.email,
            _id: {
                $ne: typeof doc._id === 'string' ? db.convertToMongoId(doc._id) : doc._id
            }
        };

        collection.findOne(query, function (err, res) {
            if (err) {
                callback(err);
            } else if (res) {
                callback(null,
                    {
                        valid: false,
                        errors: [
                            {
                                attribute: 'checkMail',
                                property: 'email',
                                expected: false,
                                actual: true,
                                message: 'Email already exists'
                            }
                        ]
                    }
                );
            } else {
                callback(null, { valid: true });
            }
        });
    };

    // start validation
    self.validate = function (doc, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        doc = doc || {};
        options = options || {};

        // schema validation
        var valResult = validationFunction(doc, options.schema || schema(), options);

        // register async validator
        val.asyncValidate.register(self.checkMail, doc);

        // async validate
        val.asyncValidate.exec(valResult, callback);
    };

    return self;
};
