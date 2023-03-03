"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _logger = require('./logger'); var _logger2 = _interopRequireDefault(_logger);

 const authUserByToken = async (req, res, next) => {

	const authorization = req.headers.authorization;

	if (!authorization) {
		return res.status(401).json({ error: 'Unauthorized access' });
	}

	const token = authorization.split(' ')[1];

	try {

		const decodedToken = _jsonwebtoken2.default.verify(token, process.env.JWT_SECRET ) ;

		const user = await _User2.default.findById(decodedToken.id);

		if (!user) {
			return res.status(400).json({ message: 'User not found' });
		}

		return next();

	} catch (error) {

		_logger2.default.error(error);

		return res.status(400).json({ message: 'Invalid token' });

	}

}; exports.authUserByToken = authUserByToken;