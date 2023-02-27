'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}
var _express = require('express');
var _csurf = require('csurf');
var _csurf2 = _interopRequireDefault(_csurf);

var _UserController = require('../controllers/UserController');
var _UserController2 = _interopRequireDefault(_UserController);

const router = _express.Router.call(void 0);

const csrfProtection = _csurf2.default.call(void 0, { cookie: true });

router.get('/register', csrfProtection, _UserController2.default.register);

exports.default = router;
