"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _nodemailer = require('nodemailer'); var _nodemailer2 = _interopRequireDefault(_nodemailer);
var _validator = require('validator'); var _validator2 = _interopRequireDefault(_validator);

var _ = require('..');

var _createusertoken = require('../helpers/create-user-token');
var _getuserbytoken = require('../helpers/get-user-by-token'); var _getuserbytoken2 = _interopRequireDefault(_getuserbytoken);
var _logger = require('../helpers/logger'); var _logger2 = _interopRequireDefault(_logger);
var _validateuserfields = require('../helpers/validate-user-fields');
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);


class UserController {

	 async register(req, res) {

		const errorResponse = await _validateuserfields.validateUserFields.call(void 0, req.body) ;

		if (errorResponse.length !== 0) {
			return res.status(422).json({ errors: errorResponse });
		}

		try {
			const newUser = await new (0, _User2.default)({
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				password: req.body.password
			}).save();

			// generated hash password on User Model

			const token = _createusertoken.createAccessToken.call(void 0, newUser);
			await _createusertoken.createRefreshToken.call(void 0, newUser);

			const response = {
				_id: newUser._id,
				nome: newUser.name,
				email: newUser.email,
				phone: newUser.phone,
				token: token
			};

			return res.status(201).json({
				message: 'User successfully registered and authenticated',
				response
			});
		} catch (error) {
			_logger2.default.error(error);
			return res.status(500).json({ message: 'Error registering user' });
		}

	}

	 async login(req, res) {

		const login = {
			email: req.body.email,
			password: req.body.password
		};

		// check empty fields
		const emptyFields = _validateuserfields.existsEmptyFields.call(void 0, login);

		if (emptyFields.length !== 0) {
			return res.status(422).json({ message: `Required: ${emptyFields.join(', ')}` });
		}

		// validate email
		if (!_validator2.default.isEmail(login.email)) {
			return res.status(422).json({ message: 'Enter a valid email' });
		}

		// check if user exists and if password matches on the User Model
		const user = await _User2.default.findOne({ email: login.email });

		if (!user || !await user.passwordsCompare(login.password)) {
			// random delay from 700 to 800 milliseconds
			const delay = 600 + Math.random() * 100;
			await new Promise((resolve) => setTimeout(resolve, delay));

			return res.status(401).json({ message: 'Invalid email or/and password' });
		}

		const token = _createusertoken.createAccessToken.call(void 0, user);
		await _createusertoken.createRefreshToken.call(void 0, user);

		return res.status(200).json({ message: 'Successfully authenticated', token });

	}

	// to protect
	 async checkUser(req, res) {

		let currentUser;

		const authorization = req.headers.authorization;

		if (!authorization) {
			return res.status(401).json({ message: 'Unauthorized access' });
		}

		try {
			const token = authorization.split(' ')[1];
			const decodedToken = _jsonwebtoken2.default.verify(token, process.env.JWT_SECRET ) ;

			currentUser = await _User2.default.findById(decodedToken.id);

			currentUser.password = undefined;
		} catch (error) {
			_logger2.default.error(error);
			return res.status(400).json({ message: 'Invalid token' });
		}

		return res.status(200).json({ currentUser });

	}

	 async getUserById(req, res) {

		const id = req.params.id;

		const user = await _User2.default.findById(id).select('-password');

		if (!user) {
			return res.status(422).json({ message: 'User not found' });
		}

		return res.status(200).json({ user });

	}

	 async editUser(req, res) {

		const user = await _getuserbytoken2.default.call(void 0, req.headers.authorization );

		const userToEdit = {
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,
			password: req.body.password,
			confirmPassword: req.body.confirmPassword,
			image: _optionalChain([req, 'access', _3 => _3.file, 'optionalAccess', _4 => _4.filename])
		};

		const response = await _validateuserfields.validateUserFields.call(void 0, userToEdit, user);

		if (!('name' in response)) {
			return res.status(422).json({ errors: response });
		}

		try {
			await _User2.default.findOneAndUpdate(
				{ _id: user._id },
				{ $set: response }
			);

			return res.status(200).json({ message: 'Updated successfully' });
		} catch (error) {
			_logger2.default.error(error);
			return res.status(500).json({ message: 'Error in user update' });
		}
	}

	 async refreshToken(req, res) {

		try {
			// send old refresh token
			const user = await _getuserbytoken2.default.call(void 0, req.headers.authorization );

			const storedRefreshToken = await _.redisClient.get(`refreshToken.${user.id}`);

			const refreshToken = _optionalChain([req, 'access', _5 => _5.headers, 'access', _6 => _6.authorization, 'optionalAccess', _7 => _7.split, 'call', _8 => _8(' '), 'access', _9 => _9[1]]);

			if (storedRefreshToken !== refreshToken) {
				return res.status(401).json({ message: 'Invalid refresh token' });
			}

			await _createusertoken.createRefreshToken.call(void 0, user);

			const newAccessToken = _createusertoken.createAccessToken.call(void 0, user);

			return res.status(200).json({ newAccessToken });
		} catch (error) {
			_logger2.default.error(error);
			return res.status(400).json({ message: 'Invalid refresh token' });
		}
	}

	 async requestNewPassword(req, res) {

		try {

			const { email } = req.body;

			if (!email) {
				return res.status(422).json({ message: 'Email required' });
			}

			const user = await _User2.default.findOne({ email });

			if (!_validator2.default.isEmail(email) || !user) {
				return res.status(400).json({ message: 'Invalid email' });
			}

			const token = _createusertoken.createAccessToken.call(void 0, user, '1h');

			const transporter = _nodemailer2.default.createTransport({
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT ,
				secure: true,
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASSWORD
				}
			});

			await transporter.sendMail({
				from: `Get a Pet <no-reply.${process.env.SMTP_USER}>`,
				replyTo: `no-reply.${process.env.SMTP_USER}`,
				priority: 'high',
				to: user.email,
				subject: 'Redefinir senha',
				html:
					`
				<p>Hello, ${user.name}!</p>
				<p>We received a request to reset your password.</p>
				<p>Click on the link below to reset your password:</p>
				<a href="${process.env.BASE_URL || 'http://localhost:3333'}/reset_password/${token}">Reset Password</a>
				<p>If you didn't request account recovery, please ignore this email. This link will expire in 1 hour.</p>
				`
			});

			return res.json({ message: 'Email successfully sent' });

		} catch (error) {
			_logger2.default.error(error);
			return res.status(500).json({ message: 'Error sending email' });
		}
	}

	 async resetPassword(req, res) {

		const { password } = req.body;

		const passwordInvalidations = _validateuserfields.validatePassword.call(void 0, password);

		if (passwordInvalidations.length !== 0) {
			return res.status(422).json({ errors: passwordInvalidations });
		}

		const user = await _getuserbytoken2.default.call(void 0, req.headers.authorization );

		user.password = password;

		try {
			await user.save();
		} catch (error) {
			_logger2.default.error(error);
			return res.status(500).json({ message: 'Error in password update' });
		}

		return res.json({ message: 'Password successfully changed' });
	}

}

exports. default = new UserController();