'use strict';

var async = require('async');
var jwt = require('jwt-simple');
var _ = require('lodash');
var os = require('os');
var fs = require('fs');

/**
 * Auth
 */
module.exports = function (options) {
    var config = options.config;
    var db = options.db;
    var tokensRepo = db.connection('bbTest').collection('tokens');
    var rightsRepo = db.connection('bbTest').collection('rights');
    var rolesRepo = db.connection('bbTest').collection('roles');
    var groupsRepo = db.connection('bbTest').collection('groups');
    var resourceRightsRepo = db.connection('bbTest').collection('resource_rights');

    var self = {};

    var generateGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r, v;

            r = Math.random() * 16 | 0;
            v = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    };

    function getInfoFromComment(comment, type) {
        comment = comment.substring(comment.lastIndexOf('/**'));
        var splittedComment = comment.split('@' + type);

        if (splittedComment.length === 1) {
            return null;
        }

        var result = splittedComment[1].substring(0, splittedComment[1].indexOf(os.EOL));
        return result.trim();
    }

    function getRoutesFromRoutes(callback) {
        var routesFile = options.config.SERVER_PATH + '/routes.js';

        fs.readFile(routesFile, {encoding: 'utf8'}, function (error, file) {
            if (error) {
                callback(error);
                return;
            }

            var routes = {};
            var lines = file.split(os.EOL);

            // examples:
            // router.get('/users/:id', middleware.auth, controller.get('/main/users').getById);
            // socketRouter.on('awesomeThings', controller.get('/main/index').socket_awesomeThings);

            _(lines).forEach(function (line) {
                // check on get function of controller
                if (line.indexOf('.get') > 0) {
                    // decide which api type with socket.on function
                    var type = line.indexOf('.on') > 0 ? 'socket' : 'rest';

                    var parts = line.split(',');
                    var route = parts[0].split('\'')[1];
                    var path = parts[parts.length - 1].split('(')[1].replace(/'|\)|;/g, '').replace('.', '/');

                    routes[path] = {route: route, type: type};
                }
            });

            callback(null, routes);
        });
    }

    function isEmptyArray (array) {
        return array === undefined || array === null || (isArray(array) && isEmpty(array));
    }

    var getType = function (value) {
        // inspired by http://techblog.badoo.com/blog/2013/11/01/type-checking-in-javascript/

        // handle null in old IE
        if (value === null) {
            return 'null';
        }

        // handle DOM elements
        if (value && (value.nodeType === 1 || value.nodeType === 9)) {
            return 'element';
        }

        var s = Object.prototype.toString.call(value);
        var type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

        // handle NaN and Infinity
        if (type === 'number') {
            if (isNaN(value)) {
                return 'nan';
            }
            if (!isFinite(value)) {
                return 'infinity';
            }
        }

        return type;
    };

    var isArray = function (value) {
        return getType(value) === 'array';
    };


    var isObject = function (value) {
        return getType(value) === 'object';
    };

    var isEmpty = function (value) {
        if (isArray(value)) {
            return value.length === 0;
        }

        if (isObject(value)) {
            return Object.keys(value).length === 0;
        }

        return true;
    };

    var arrayFirst = function (array, predicate, context) {
        if (isEmptyArray(array)) {
            return null;
        }

        if (!isArray(array)) {
            throw getTypeError('array', array, []);
        }

        for (var i = 0, j = array.length; i < j; i++) {
            if (predicate.call(context, array[i])) {
                return array[i];
            }
        }

        return null;
    };

    var getTypeError = function (name, value, expectedType) {
        return new Error('Param "' + name + '" is of type ' + getType(value) + '! Type ' + getType(expectedType) + ' expected');
    };

    function addRoleRights(roles, allRoles, result) {
        // add user roles rights
        _(roles).forEach(function (roleId) {
            var role = arrayFirst(allRoles, function (item) {
                return item._id.toString() === roleId.toString();
            });

            if (role) {
                _(role.rights).forEach(function (right) {
                    // add group rights
                    result[right.toString()] = {_id: right, hasAccess: true};
                });
            }
        });
    }

    /**
     * Returns the rights of a role
     *
     * @param role
     * @param callback
     */
    self.getRightsByRole = function(role, callback) {
        var acl = {
            rest: {},
            socket: {}
        };

        rolesRepo.findOne({name: role}, function(err, res){
            if(res){
                rightsRepo.find({_id:{$in:res.rights}}).toArray(function(err, res){
                    if(res){
                        _(res).forEach(function(right){
                            if (right.type === 'socket') {
                                acl.socket[right.name] = {
                                    controller: right.controller,
                                    route: right.route,
                                    hasAccess: true
                                };
                            } else {
                                acl.rest[right.name] = {
                                    controller: right.controller,
                                    route: right.route,
                                    hasAccess: true
                                };
                            }
                        });

                        callback(null, acl);
                    }
                });
            } else {
                callback(null, acl);
            }
        });
    };

    /**
     * Returns all the user rights.
     *
     * @param {!Object} user The user object.
     * @param {Array.<ObjectID>=} user.groups The mongo ids () of the groups of the user.
     * @param {Array.<ObjectID>=} user.roles The mongo ids of the roles of the user.
     * @param {Array.<Object>=} user.rights The rights of the user. ({_id: ObjectID, hasAccess: Boolean})
     * @param {!Array} allRoles All roles of the user.
     * @param {!Array} allGroups All groups of the user.
     * @param {Array=} additionalRoles Additional roles added at runtime.
     * @param {Array.<Object>=} resourceRights The resource rights of the user. ([{right_id: ObjectID, resource: *}])
     * @returns {[{_id: ObjectID, hasAccess: Boolean, resource: *}]}
     */
    self.getUserRights = function (user, allRoles, allGroups, additionalRoles, resourceRights) {
        var tmp = {},
            result = [];

        // check params
        if (!isObject(user)) {
            throw new Error('param "user" is not an object');
        }

        // add user group rights
        if (isArray(allGroups) && !isEmpty(user.groups)) {
            _(user.groups).forEach(function (groupId) {
                // get group
                var group = arrayFirst(allGroups, function (item) {
                    return item._id.toString() === groupId.toString();
                });

                if (isObject(group)) {
                    addRoleRights(group.roles, allRoles, tmp);
                }
            });
        }

        // add user roles rights
        addRoleRights(user.roles, allRoles, tmp);

        // add additional role rights
        if (isArray(additionalRoles)) {
            _(additionalRoles).forEach(function (role) {
                if (isObject(role)) {
                    _(role.rights).forEach(function (right) {
                        // add group rights
                        tmp[right.toString()] = {_id: right, hasAccess: true};
                    });
                }
            });
        }

        // add user rights
        _(user.rights || []).forEach(function (right) {
            if (typeof right.hasAccess === 'boolean') {
                // set or override right
                tmp[right._id.toString()] = {_id: right._id, hasAccess: right.hasAccess};
            }
        });

        // resourceRights loaded from db
        // format
        // [{right_id: id, resource: {}}]

        // add resource rights
        _(resourceRights).forEach(function (resource) {
            tmp[resource.right_id.toString()] = {_id: resource.right_id, hasAccess: true, resource: resource.resource};
        });

        // merge rights to result
        _(tmp).forEach(function (right) {
            result.push(right);
        });

        return result;
    };

    /**
     * Returns the user rights to which the user has access.
     *
     * @param {!Object} user The user object.
     * @param {Array.<number>=} user.id The internal id of the user.
     * @param {Array.<ObjectID>=} user.groups The mongo ids () of the groups of the user.
     * @param {Array.<ObjectID>=} user.roles The mongo ids of the roles of the user.
     * @param {Array.<Object>=} user.rights The rights of the user. ({_id: ObjectID, hasAccess: Boolean})
     * @param {Array.<Object>=} allRights The mongo ids () of the groups of the user.
     * @param {!Array} allRoles All roles of the user.
     * @param {!Array} allGroups All groups of the user.
     * @param {Array=} additionalRoles Additional roles added at runtime.
     * @param {Array.<Object>=} resourceRights The resource rights of the user. ([{right_id: ObjectID, resource: *}])
     * @returns {Object.<string, Object>} (nameOfRight: {hasAccess: true, resource: *})
     */
    self.getUserAcl = function (user, allRights, allRoles, allGroups, additionalRoles, resourceRights) {
        // check params
//        if (!lxHelpers.isObject(user)) {
//            throw new RightsError('param "user" is not an object');
//        }

        var result = {
            rest: {},
            socket: {}
        };

        if (!allRights || (isEmpty(user.rights) && isEmpty(user.groups) && isEmpty(user.roles))) {
            return result;
        }

        var userRights = self.getUserRights(user, allRoles, allGroups, additionalRoles, resourceRights);

        if (isEmpty(userRights)) {
            return result;
        }

        _(userRights).forEach(function (userRight) {
            // get right
            var right = arrayFirst(allRights, function (item) {
                return item._id.toString() === userRight._id.toString();
            });

            // add right name to result if the user has access
            if (isObject(right) && userRight.hasAccess) {
                if (right.type === 'socket') {
                    result.socket[right.name] = {
                        controller: right.controller,
                        route: right.route,
                        hasAccess: true
                    };

                    if (userRight.resource) {
                        result.socket[right.name].resource = userRight.resource;
                    }
                } else {
                    result.rest[right.name] = {
                        controller: right.controller,
                        route: right.route,
                        hasAccess: true
                    };

                    if (userRight.resource) {
                        result.rest[right.name].resource = userRight.resource;
                    }
                }
            }
        });

        return result;
    };

    /**
     * Gets the user with his acl object.
     *
     * @param {Object|number} user The user.
     * @param {Function} callback The callback. (?Object=, ?Object=).
     */
    self.getUser = function (user, callback) {
        async.auto({
            getUser: function (next) {
                next(null, user);
            },
            getAllRights: function (next) {
                rightsRepo.find().toArray(next);
            },
            getUserGroups: ['getUser', function (next, results) {
                if (!results.getUser || isEmpty(results.getUser.groups)) {
                    next(null, []);
                } else {
                    groupsRepo.find({_id: {$in: results.getUser.groups}}).toArray(next);
                }
            }],
            getUserRoles: ['getUser', 'getUserGroups', function (next, results) {
                if (!results.getUser) {
                    next(null, []);
                } else {
                    var roles = results.getUser.roles || [],
                        groups = results.getUserGroups;

                    _(groups).forEach(function (group) {
                        _(group.roles).forEach(function (role) {
                            roles.push(role);
                        });
                    });

                    rolesRepo.find({_id: {$in: roles}}).toArray(next);
                }
            }],
            getUserResourceRights: ['getUser', 'getUserGroups', 'getUserRoles', function (next, results) {
                if (!results.getUser) {
                    next(null, []);
                } else {
                    var roles = results.getUser.roles || [],
                        groups = results.getUserGroups,
                        roleIds = [],
                        groupIds = [];

                    _(groups).forEach(function (group) {
                        groupIds.push(group._id);
                    });

                    _(roles).forEach(function (role) {
                        roleIds.push(role._id);
                    });

                    var query = {
                        $or: [
                            {user_id: results.getUser._id},
                            {group_id: {$in: groupIds}},
                            {role_id: {$in: roleIds}}
                        ]
                    };

                    resourceRightsRepo.find(query).toArray(next);
                }
            }],
            normalizeResourceRights: ['getUserResourceRights', function (next, results) {
                var resourceRights = results.getUserResourceRights,
                    result = [];

                async.each(resourceRights, function (resourceRight, innerCallback) {
                    if (resourceRight.right_id) {
                        result.push(resourceRight);
                        innerCallback();
                    } else {
                        rolesRepo.findOne({_id: resourceRight.role_id}, function (error, role) {
                            if (error) {
                                innerCallback(error);
                                return;
                            }

                            _(role.rights).forEach(function (rightId) {
                                result.push({right_id: rightId, resource: resourceRight.resource});
                            });

                            innerCallback();
                        });
                    }
                }, function (error) {
                    next(error, result);
                });
            }],
            getUserAcl: ['getAllRights', 'getUserRoles', 'normalizeResourceRights', function (next, results) {
                var user = results.getUser;
                var userRoles = results.getUserRoles;

                if (!user) {
                    next(null, {});
                    return;
                }

                // save user roles in extra property
                user.rolesAsObjects = [];

                _(userRoles).forEach(function (role) {
                    user.rolesAsObjects.push({_id: role._id, name: role.name});
                });

                user.acl = self.getUserAcl(user, results.getAllRights, results.getUserRoles, results.getUserGroups, [], results.normalizeResourceRights);

                next(null, user);
            }]
        }, function (error, results) {
            if (error) {
//               logging.syslog.error('%s! getting user from db: %j', error, name);
                callback(new Error('Error loading user from db!'));
                return;
            }

            callback(null, results.getUserAcl);
        });
    };

    /**
     * Returns the public functions from the controllers of the app.
     *
     * @param {Function} callback The callback. (?Object=, ?Object=)
     */
    self.getPublicFunctionsFromControllers = function (callback) {
        var grunt = require('grunt'),
            patternControllers = options.config.API_PATH + '/**/controllers/*.js',
            result = {};

        // get all controller files
        var controllers = grunt.file.expand(patternControllers);

        async.eachSeries(controllers, function (controllerFile, next) {
            var modulePath = '';

            fs.readFile(controllerFile, {encoding: 'utf8'}, function (error, file) {
                if (error) {
                    next(error);
                    return;
                }

                var splittedFileName = controllerFile.split('/');
                var contollerName = splittedFileName.pop().replace('.js', '');
                splittedFileName.pop();
                var moduleName = splittedFileName.pop();

                var splittedFile = file.split('self.');
                var length = splittedFile.length;

                var i;
                for (i = 1; i < length; i++) {
                    var line = splittedFile[i].split(os.EOL)[0];

                    if (line.indexOf('=') > 0) {
                        var functionName = line.split('=');
                        var fullPathToRight = modulePath + moduleName + '/' + contollerName + '/' + functionName[0].trim();
                        var roles = getInfoFromComment(splittedFile[i - 1], 'roles');
                        var description = getInfoFromComment(splittedFile[i - 1], 'description');

                        var right = {
                            name: fullPathToRight,
                            controller: modulePath + moduleName + '/' + contollerName
                        };

                        if (description) {
                            right.description = description;
                        }

                        if (roles) {
                            right.roles = roles.split(',');
                        }

                        result[right.name] = right;
                    }
                }

                next();
            });
        }, function (error) {
            var resultArray = [];

            _(result).forEach(function (value) {
                resultArray.push(value);
            });

            callback(error, resultArray);
        });
    };

    /**
     * Reads the rights from the controllers and saves them in db.
     *
     * @param {Function} callback The callback. (?Object=, ?Object=)
     */
    self.refreshRightsInDb = function (callback) {
        var rightsCreated = 0;

        async.auto({
            getRoutesFromRoutes: function (next) {
                getRoutesFromRoutes(next);
            },
            getPublicFunctionsFromControllers: function (next) {
                self.getPublicFunctionsFromControllers(next);
            },
            processRights: ['getRoutesFromRoutes', 'getPublicFunctionsFromControllers', function (next, results) {

                var routes = results.getRoutesFromRoutes;
                var rights = results.getPublicFunctionsFromControllers;
                var roles = {};

                function addRightToRoles(rightRoles, rightId) {
                    _(rightRoles).forEach(function (role) {
                        role = role.trim();
                        roles[role] = roles[role] || {};
                        roles[role].rights = roles[role].rights || [];
                        roles[role].rights.push(rightId);
                    });
                }

                async.each(rights, function (right, nextRight) {
                    rightsRepo.findOne({name: right.name}, function (error, result) {
                        if (error) {
                            nextRight(error);
                            return;
                        }

                        var newRole = {
                            name: right.name,
                            description: right.description,
                            controller: right.controller,
                            route: routes['/' + right.name].route,
                            type: routes['/' + right.name].type
                        };

                        if (!result) {
                            rightsRepo.insert(newRole, function (error, result) {
                                if (error) {
                                    nextRight(error);
                                    return;
                                }

                                if (result) {
                                    rightsCreated++;
                                    addRightToRoles(right.roles, result[0]._id);
                                }

                                nextRight();
                            });
                        } else {
                            addRightToRoles(right.roles, result._id);

                            right.description = right.description || '';
                            var route = routes['/' + right.name].route;

                            if (result.description !== right.description || result.controller !== right.controller || result.route !== route) {
                                rightsRepo.update({_id: result._id}, {$set: {description: right.description, controller: right.controller, route: route}}, function (error, result) {
                                    if (error) {
                                        nextRight(error);
                                        return;
                                    }

                                    if (result) {
                                        rightsCreated++;
                                    }

                                    nextRight();
                                });
                            } else {
                                nextRight();
                            }
                        }
                    });
                }, function (err) {
                    if (err) {
                        return next(err);
                    }

                    next(null, roles);
                });
            }],
            processRoles: ['processRights', function (next, results) {
                var roles = results.processRights;
                var roleKeys = Object.keys(results.processRights);

                if (roleKeys.length > 0) {
                    async.each(roleKeys, function (roleName, next) {
                        rolesRepo.findOne({name: roleName}, function (error, result) {
                            if (error) {
                                next(error);
                                return;
                            }

                            if (result) {
                                rolesRepo.update({_id: result._id}, {$set: {rights: roles[roleName].rights}}, function (error, result) {
                                    if (error) {
                                        next(error);
                                        return;
                                    }

                                    if (result) {
                                    }

                                    next();
                                });
                            } else {
                                rolesRepo.insert({name: roleName, rights: roles[roleName].rights}, function (error) {
                                    if (error) {
                                        next(error);
                                        return;
                                    }

                                    next();
                                });
                            }
                        });
                    }, function (error) {
                        next(error, rightsCreated);
                    });
                } else {
                    next(null, rightsCreated);
                }
            }]
        }, function (error, results) {
            callback(null, results);
        });
    };

    /**
     * Checks if acl has access to route
     *
     * @param route
     * @param acl
     * @returns {*|Array|boolean}
     */
    self.checkAccessToRoute = function (route, acl) {
        route = route || '';
        acl = acl || [];

        var keys = Object.keys(acl);
        var i, len = keys.length;
        var hasAccess = false;
        for (i = 0; i < len; i++) {
            if (acl[keys[i]].route === route) {
                hasAccess = acl[keys[i]].hasAccess;
                break;
            }
        }

        return hasAccess;
    };

    /**
     * Set the last activity in token
     *
     * @param token
     * @param callback
     */
    self.updateLastActivity = function(token, callback){
        tokensRepo.update({_id: token._id}, {$set: {last_activity: new Date()}}, callback);
    };

    /**
     * Checks the JSON web token on validity, expiration, inactivity
     *
     * @param tokenData
     * @param next
     * @returns {*}
     */
    self.checkToken = function (tokenData, next) {
        var webToken;

        try {
            webToken = jwt.decode(tokenData, config.WEB_TOKEN.secret);
        } catch (err) {
            return next(new options.errors.AccessError('Wrong token key signature'));
        }

        // check token in database
        tokensRepo.find({access_id: webToken.accessId}).toArray(function (err, success) {
            // if not found -> error
            if (err || success.length !== 1) {
                return next(new options.errors.AccessError('Token not in database'));
            }

            var token = success[0];
            var currentTime = new Date().getTime();

            // expired
            if (currentTime > token.expires) {
                return next(new options.errors.AccessError('Token expired'));
            }

            // inactivity
            if (currentTime > token.last_activity.getTime() + config.WEB_TOKEN.inactivityTime * 1000) {
                return next(new options.errors.AccessError('Last activity expired'));
            }

            // update last activity in token database
            self.updateLastActivity(token, function () {
                // put user in request
                var user = {
                    is_authenticated: true,
                    displayName: token.displayName,
                    accessId: webToken.accessId,
                    acl: token.user_acl.rest,
                    sockets: token.user_acl.socket,
                    rolesAsObjects: token.user_acl.rolesAsObjects
                };

                next(null, user);
            });
        });
    };

    /**
     * Creates a JSON web token
     *
     * @param name The name that will sent to frontend
     * @param user
     * @param callback
     */
    self.createToken = function (name, user, callback) {
        async.auto({
            getUserAcl: function (next) {
                self.getUser(user, next);
            },
            getTokenData: ['getUserAcl', function (next, results) {
                // access object
                var tokenData = {
                    access_id: generateGuid(),
                    created: new Date(),
                    last_activity: new Date(),
                    expires: new Date().getTime() + config.WEB_TOKEN.maxLifeTime * 1000,
                    displayName: name,
                    user_acl: {
                        rolesAsObjects: results.getUserAcl.rolesAsObjects,
                        rest: results.getUserAcl.acl.rest,
                        socket: results.getUserAcl.acl.socket
                    }
                };

                next(null, tokenData);
            }],
            saveAccessData: ['getTokenData', function (next, results) {
                tokensRepo.insert(results.getTokenData, next);
            }],
            createWebToken: ['saveAccessData', function (next, results) {
                next(null, jwt.encode({accessId: results.getTokenData.access_id}, config.WEB_TOKEN.secret));
            }]
        }, function (error, results) {
            if(error){
                return callback(error);
            }

            var routes = [];
            _.forIn(results.getTokenData.user_acl.rest, function(val, key){
                if(results.getTokenData.user_acl.rest[key].hasAccess === true) {
                    routes.push(results.getTokenData.user_acl.rest[key].route);
                }
            });

            var roles = [];
            results.getTokenData.user_acl.rolesAsObjects.map(function(item){
                roles.push(item.name);
            });

            callback(null, {token: results.createWebToken, userAcl:{acl: routes, roles:roles, name: name}});
        });
    };

    return self;
};