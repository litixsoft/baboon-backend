'use strict';

var util = require('util');

/**
 * Creates a new AccessError.
 * @constructor
 */
function AccessError (message, clientMessage) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    var defaultMessage = '403: Forbidden';

    this.name = 'AccessError';
    this.message = message || defaultMessage;
    this.clientMessage = clientMessage || defaultMessage;
    this.status = 403;
}

/**
 * Creates a new AuthError.
 * @constructor
 */
function AuthError (message, clientMessage) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    var defaultMessage = '401: Unauthorized';

    this.name = 'AuthError';
    this.message = message || defaultMessage;
    this.clientMessage = clientMessage || defaultMessage;
    this.status = 401;
}

/**
 * Creates a new BadRequestError.
 * @constructor
 */
function BadRequestError (message, clientMessage) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    var defaultMessage = '400: Bad request';

    this.name = 'BadRequestError';
    this.message = message || defaultMessage;
    this.clientMessage = clientMessage || defaultMessage;
    this.status = 400;
}

/**
 * Creates a new ValidationError.
 * @constructor
 *
 * @param {?array} errors
 */
function ValidationError (errors) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    this.name = 'ValidationError'; //set our function’s name as error name.
    this.message = '422: Unprocessable Entity';
    this.status = 422;
    this.errors = errors || [];
}

/**
 * Creates a new ServerError.
 * @constructor
 *
 * @param {String=} message
 * @param {String=} clientMessage
 */
function ServerError (message, clientMessage) {
    Error.call(this); //super constructor
    Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object

    var defaultMessage = '500: Internal Server Error';

    this.name = 'ServerError'; //set our function’s name as error name.
    this.message = message || defaultMessage;
    this.clientMessage = clientMessage || defaultMessage;
    this.status = 500;
}

/**
 * Creates a new DataNotFoundError.
 * @constructor
 */
function DataOperationError (message, data, repoName, dbResult, clientMessage) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    var defaultMessage = '400: No data found or data could not be processed';

    this.name = 'DataOperationError';
    this.message = message || defaultMessage;
    this.clientMessage = clientMessage || defaultMessage;
    this.status = 400;
    this.data = data;
    this.repo = repoName;
    this.result = dbResult;

    // delete connection info from dbResult
    delete this.result.connection;
}

// inherit from Error
util.inherits(AccessError, Error);
util.inherits(AuthError, Error);
util.inherits(BadRequestError, Error);
util.inherits(ValidationError, Error);
util.inherits(ServerError, Error);
util.inherits(DataOperationError, Error);

exports.AccessError = AccessError;
exports.AuthError = AuthError;
exports.BadRequestError = BadRequestError;
exports.ValidationError = ValidationError;
exports.ServerError = ServerError;
exports.DataOperationError = DataOperationError;
