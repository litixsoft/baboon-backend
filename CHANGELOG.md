<a name"0.7.8"></a>
### 0.7.8 (2015-03-31)


#### Features

* discrete client message in errors, e.g. to discriminate between short error mess ([12e3415e](https://github.com/litixsoft/baboon-backend/commit/12e3415e))


<a name="0.7.7"></a>
### 0.7.7 (2015-03-19)


#### Features

* add env variable CONFIG which will be used to load the configuration file. If no ([a7970a13](https://github.com/litixsoft/baboon-backend/commit/a7970a138d98d30ceffa2d9909ff7492521997d0))


<a name="0.7.6"></a>
### 0.7.6 (2015-03-11)


#### Features

* **lxAuth:** add method removeToken() to remove a token from the database ([aa1a0255](https://github.com/litixsoft/baboon-backend/commit/aa1a0255d687f4390f160625c36d5c3edef54752))


<a name="0.7.5"></a>
### 0.7.5 (2015-02-27)


#### Bug Fixes

* crash when no user in token ([06840786](https://github.com/litixsoft/baboon-backend/commit/06840786dc533b579436893705c8e97d4f249876))
* last_activity time is now calculated correctly ([e70c3e5d](https://github.com/litixsoft/baboon-backend/commit/e70c3e5db3ccf4ca3d30a3033407b44651f7dbe4))
* LxMail, fix in function configureMail to override email address in debug mode ([a3576fb0](https://github.com/litixsoft/baboon-backend/commit/a3576fb074241d97a5bcdc58ad216d3658b759aa))
* **LxMail:** replace all occurrences of replace values ([1eed6046](https://github.com/litixsoft/baboon-backend/commit/1eed604694f9a983736d09e6271d9486433e17a6))
* **middleware:** next() could be called twice in middleware allRequests() ([739ce9fa](https://github.com/litixsoft/baboon-backend/commit/739ce9fae9b3e15ba2f64c852cc113466d1efe9f))


#### Features

* update dependencies for io.js / node.js 0.12 compability ([d883d475](https://github.com/litixsoft/baboon-backend/commit/d883d475b2ded8dad891c40714598d042ec70d46))
* update to lx-valid v0.4.0 ([31d162ab](https://github.com/litixsoft/baboon-backend/commit/31d162ab6fa8e95c589425258c60d6995be41b1e))
* save http verb in rights collection ([38f54830](https://github.com/litixsoft/baboon-backend/commit/38f5483092d9869f946796dcd0fc13974e7bf788))
* store complete user object in token database ([8fa5d1fc](https://github.com/litixsoft/baboon-backend/commit/8fa5d1fcb09fb6a8668da245d58ae5d4e68f9cae))
* add expires_last_activity field in token database. ([e787a902](https://github.com/litixsoft/baboon-backend/commit/e787a902e501779ec56c6c6fc8d8611905fbb427))
* **LxMail:** add original receiver of the email in the mail body when debug option is enabled ([a79841a4](https://github.com/litixsoft/baboon-backend/commit/a79841a455e9149782b2c2d643afc25b1f176028))
* **lxErrors:** add DataOperationError to track errors like not data was found in the db or a re ([f40948c1](https://github.com/litixsoft/baboon-backend/commit/f40948c19f9c8ccf5120c465c3b8c0fa6ec29d3b))


<a name="0.7.4"></a>
### 0.7.4 (2015-02-25)


#### Bug Fixes

* **middleware:** next() could be called twice in middleware allRequests() ([739ce9fa](https://github.com/litixsoft/baboon-backend/commit/739ce9fae9b3e15ba2f64c852cc113466d1efe9f))


#### Features

* **lxErrors:** add DataOperationError to track errors like not data was found in the db or a re ([f40948c1](https://github.com/litixsoft/baboon-backend/commit/f40948c19f9c8ccf5120c465c3b8c0fa6ec29d3b))


<a name="0.7.3"></a>
### 0.7.3 (2015-02-20)


#### Features

* update dependencies for io.js / node.js 0.12 compatibility ([d883d475](https://github.com/litixsoft/baboon-backend/commit/d883d475b2ded8dad891c40714598d042ec70d46))


<a name="0.7.2"></a>
### 0.7.2 (2015-01-21)


#### Features

* update to lx-valid v0.4.0 ([31d162ab](https://github.com/litixsoft/baboon-backend/commit/31d162ab6fa8e95c589425258c60d6995be41b1e))


<a name="0.7.1"></a>
### 0.7.1 (2015-01-21)


#### Features

* **LxMail:** add original receiver of the email in the mail body when debug option is enabled ([a79841a4](https://github.com/litixsoft/baboon-backend/commit/a79841a455e9149782b2c2d643afc25b1f176028))


<a name="0.7.0"></a>
## 0.7.0 (2015-01-15)


#### Bug Fixes

* crash when no user in token ([06840786](https://github.com/litixsoft/baboon-backend/commit/06840786dc533b579436893705c8e97d4f249876))


#### Features

* save http verb in rights collection ([38f54830](https://github.com/litixsoft/baboon-backend/commit/38f5483092d9869f946796dcd0fc13974e7bf788))


<a name="0.6.1"></a>
### 0.6.1 (2015-01-13)


#### Bug Fixes

* last_activity time is now calculated correctly ([e70c3e5d](https://github.com/litixsoft/baboon-backend/commit/e70c3e5db3ccf4ca3d30a3033407b44651f7dbe4))


<a name="0.6.0"></a>
## 0.6.0 (2015-01-12)


#### Bug Fixes

* LxMail, fix in function configureMail to override email address in debug mode ([a3576fb0](https://github.com/litixsoft/baboon-backend/commit/a3576fb074241d97a5bcdc58ad216d3658b759aa))


#### Features

* store complete user object in token database ([8fa5d1fc](https://github.com/litixsoft/baboon-backend/commit/8fa5d1fcb09fb6a8668da245d58ae5d4e68f9cae))
* add expires_last_activity field in token database. ([e787a902](https://github.com/litixsoft/baboon-backend/commit/e787a902e501779ec56c6c6fc8d8611905fbb427))


<a name="0.5.9"></a>
### 0.5.9 (2015-02-27)


#### Bug Fixes

* **LxMail:** replace all occurrences of replace values ([912fff48](https://github.com/litixsoft/baboon-backend/commit/912fff48522e8d3fb7c4ba0def16f7e768b3fd83))


<a name="0.5.8"></a>
### 0.5.8 (2015-02-26)


#### Bug Fixes

* **LxMail:** set mail.to from debug when config.debug is set ([cc4214e6](https://github.com/litixsoft/baboon-backend/commit/cc4214e613c2c30a8172a792c58a286e7184cbe8))
* **middleware:** next could not be called in middleware allRequest() ([f1756627](https://github.com/litixsoft/baboon-backend/commit/f17566272fb8acc478da76a234eb2aa791326c05))


#### Features

* **LxMail:** add original receiver of the email in the mail body when debug option is enabled ([c094dc3a](https://github.com/litixsoft/baboon-backend/commit/c094dc3ac3445b4c28c11c3945335cfa3941a166))


<a name="0.5.7"></a>
### 0.5.7 (2014-11-14)


#### Bug Fixes

* add error handling for function params to prevent server crash ([2c428e14](https://github.com/litixsoft/baboon-backend/commit/2c428e145072c93eeb7590708b5b309f84c6416c))
* LxAuth, fix in function getPublicFunctinsFromControllers to get complete in dept ([e1897780](https://github.com/litixsoft/baboon-backend/commit/e1897780b656b2da9f4ae463a515178d2cc6b917))
* LxErrors, BadRequestError is now BadRequestError ([8cf2c483](https://github.com/litixsoft/baboon-backend/commit/8cf2c483d3c461411c02b6781dfe37e9adfa7358))


#### Features

* add ServerError class to lxErrors ([ac5913b6](https://github.com/litixsoft/baboon-backend/commit/ac5913b6ce643067da9ad6ad12ed7678c6e201ca))


<a name="0.5.6"></a>
### 0.5.6 (2014-11-06)


#### Features

* add user id to token collection


<a name="0.5.5"></a>
### 0.5.5 (2014-10-30)


#### Bug Fixes

* fix error in Auth


<a name="0.5.4"></a>
### 0.5.4 (2014-10-27)


#### Bug Fixes

* remove hard coded connection name in LxAuth ([c7e38c2b](https://github.com/litixsoft/baboon-backend/commit/c7e38c2b3c1f22de0bfab67de581ddb83ef56cb0))


<a name="0.5.3"></a>
### 0.5.3 (2014-10-24)


<a name="0.5.2"></a>
### 0.5.2 (2014-10-24)


<a name="0.5.0"></a>
### 0.5.0 (2014-08-21)

The first version after the separation of backend and frontend contains only the basic features.
But this version is stable does not yet contain all the features of the previous version 0.4.x


### Features

* Complete Application Structure
* Grunt with development, test and report tasks
* Test Suite jasmine-node
* Regression tests
* Debugging with nodemon and node-inspector
* MongoDB integration with lxMongoDb or native driver
* Basic config system
* API controller routing
* Socket.io 1.x for Websocket API
