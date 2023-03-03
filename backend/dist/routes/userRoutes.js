"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express');

var _UserController = require('../controllers/UserController'); var _UserController2 = _interopRequireDefault(_UserController);
var _authuserbytoken = require('../helpers/auth-user-by-token');
var _imageupload = require('../helpers/image-upload'); var _imageupload2 = _interopRequireDefault(_imageupload);
var _ratelimiter = require('../helpers/rate-limiter');

const router = _express.Router.call(void 0, );

router.post('/register', _UserController2.default.register);
router.post('/login', _ratelimiter.rateLimiter, _UserController2.default.login);

// to protect
router.get('/checkuser', _UserController2.default.checkUser);

router.get('/:id', _UserController2.default.getUserById);
router.patch('/edit', _authuserbytoken.authUserByToken, _imageupload2.default.single('image'), _UserController2.default.editUser);

router.post('/refresh_token', _UserController2.default.refreshToken);
router.post('/forgot_password', _ratelimiter.rateLimiter, _UserController2.default.requestNewPassword);
router.post('/reset_password', _authuserbytoken.authUserByToken, _UserController2.default.resetPassword);

exports. default = router;