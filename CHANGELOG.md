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
