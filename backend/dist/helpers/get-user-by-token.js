"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);

const getUserByToken = async (authorization) => {

	const token = authorization.split(' ')[1];

	const decodedToken = _jsonwebtoken2.default.verify(token, process.env.JWT_SECRET ) ;

	const user = await _User2.default.findById(decodedToken.id) ;

	return user;

};

exports. default = getUserByToken;