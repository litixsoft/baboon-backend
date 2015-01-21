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
