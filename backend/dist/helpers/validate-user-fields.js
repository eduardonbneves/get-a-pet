"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _passwordvalidator = require('password-validator'); var _passwordvalidator2 = _interopRequireDefault(_passwordvalidator);
var _validator = require('validator'); var _validator2 = _interopRequireDefault(_validator);

var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _logger = require('./logger'); var _logger2 = _interopRequireDefault(_logger);

 function existsEmptyFields(body) {

	const emptyFields = [];
	for (const [key, value] of Object.entries(body)) {
		if (!value) {
			emptyFields.push(key);
		}
	}

	return emptyFields;

} exports.existsEmptyFields = existsEmptyFields;

 function validateName(name) {

	const validator = new (0, _passwordvalidator2.default)();

	validator
		.is().min(3)
		.is().max(128)
		.has().not().symbols()
		.has().not().digits()
		.has().spaces();

	return validator.validate(name, { details: true }) ;

} exports.validateName = validateName;

 function validatePassword(password) {

	const validator = new (0, _passwordvalidator2.default)();

	validator
		.is().min(10)
		.is().max(128)
		.has().uppercase()
		.has().lowercase()
		.has().symbols()
		.has().digits()
		.is().not().oneOf(['@Passw0rdd', 'Password@123']);

	return validator.validate(password, { details: true }) ;

} exports.validatePassword = validatePassword;

 async function validateUserFields(body, user) {

	const isEdit = !user ? false : true;

	const errorResponse = [];

	// return userEdited if user is not undefined
	const userEdited = {
		name: _optionalChain([user, 'optionalAccess', _ => _.name]),
		email: _optionalChain([user, 'optionalAccess', _2 => _2.email]),
		phone: _optionalChain([user, 'optionalAccess', _3 => _3.phone]),
		password: _optionalChain([user, 'optionalAccess', _4 => _4.password]),
		image: _optionalChain([user, 'optionalAccess', _5 => _5.image])
	};

	let fields;

	if (isEdit) {
		fields = {
			name: body.name,
			email: body.email,
			phone: body.phone
		};
	} else {
		fields = {
			name: body.name,
			email: body.email,
			phone: body.phone,
			password: body.password,
			confirmPassword: body.confirmPassword
		};
	}

	// empty fields
	const emptyFields = existsEmptyFields(fields);

	if (emptyFields.length > 0) {
		errorResponse.push({ message: `Required: ${emptyFields.join(', ')}` });
		return errorResponse;
	}

	// validate name
	const nameInvalidations = validateName(fields.name);

	if (nameInvalidations.length !== 0) {
		errorResponse.push({ name: nameInvalidations });
	}

	if (isEdit && fields.name !== _optionalChain([user, 'optionalAccess', _6 => _6.name]))
		userEdited.name = fields.name;

	// validate email
	if (!_validator2.default.isEmail(fields.email)) {
		errorResponse.push({ email: 'Enter a valid email' });
	}

	if (isEdit) {
		if (fields.email !== _optionalChain([user, 'optionalAccess', _7 => _7.email]) && await _User2.default.exists({ email: fields.email })) {
			errorResponse.push({ email: 'Email already registered' });
		} else
		if (fields.email !== _optionalChain([user, 'optionalAccess', _8 => _8.email]))
			userEdited.email = fields.email;
	} else {
		if (await _User2.default.exists({ email: fields.email })) {
			errorResponse.push({ email: 'Email already registered' });
		}
	}

	// validate phone
	if (!_validator2.default.isMobilePhone(fields.phone, (process.env.PHONE_COUNTRY_CODE ) || 'pt-BR')) {
		errorResponse.push({ phone: 'Invalid phone number' });
	} else {
		if (fields.phone !== _optionalChain([user, 'optionalAccess', _9 => _9.phone]))
			userEdited.phone = fields.phone;
	}

	// validate password
	if (!isEdit) {
		if (fields.password !== fields.confirmPassword) {
			errorResponse.push({ 'password fields': 'Password and confirmation password do not match' });
		} else {
			const passwordInvalidations = validatePassword(fields.password);

			if (passwordInvalidations.length !== 0) {
				errorResponse.push({ password: passwordInvalidations });
			}
		}
	} else {
		if (body.password || body.confirmPassword) {
			if (body.password !== body.confirmPassword) {
				errorResponse.push({ 'password fields': 'Password and confirmation password do not match' });
			} else {
				const passwordInvalidations = validatePassword(body.password);

				if (passwordInvalidations.length !== 0) {
					errorResponse.push({ password: passwordInvalidations });
				}

				if (!await _optionalChain([user, 'optionalAccess', _10 => _10.passwordsCompare, 'call', _11 => _11(body.password)])) {
					const salt = await _bcryptjs2.default.genSalt(13);
					const hashPassword = await _bcryptjs2.default.hash(body.password, salt);
					userEdited.password = hashPassword;
				}
			}
		}

		if (body.image) {

			_fs2.default.unlink(process.env.IMAGES_DIR  + 'users/' + _optionalChain([user, 'optionalAccess', _12 => _12.image]), (error) => {
				if (error) {
					_logger2.default.error(error);
					return;
				}
			});

			userEdited.image = body.image;
		}
	}

	if (isEdit && errorResponse.length === 0) {

		if (_optionalChain([user, 'optionalAccess', _13 => _13.name]) !== userEdited.name || _optionalChain([user, 'optionalAccess', _14 => _14.email]) !== userEdited.email
			|| _optionalChain([user, 'optionalAccess', _15 => _15.phone]) !== userEdited.phone || _optionalChain([user, 'optionalAccess', _16 => _16.password]) !== userEdited.password
			|| _optionalChain([user, 'optionalAccess', _17 => _17.image]) !== userEdited.image) {
			return userEdited;
		}

		errorResponse.push({ message: 'All up to date' });
	}

	return errorResponse;

} exports.validateUserFields = validateUserFields;