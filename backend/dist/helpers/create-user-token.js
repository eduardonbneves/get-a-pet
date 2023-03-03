"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _jsonwebtoken = require('jsonwebtoken'); var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _ = require('..');



 const createAccessToken = (user, timeout) => {
	const accessToken = _jsonwebtoken2.default.sign(
		{
			id: user._id
		},
		process.env.JWT_SECRET ,
		{ expiresIn: timeout || process.env.ACCESS_TOKEN_DURATION || '20s' }
	);

	return accessToken;
}; exports.createAccessToken = createAccessToken;

 const createRefreshToken = async (user) => {
	const refreshToken = _jsonwebtoken2.default.sign(
		{
			id: user._id
		},
	process.env.JWT_SECRET ,
	{ expiresIn: process.env.REFRESH_TOKEN_DURATION || '1d' }
	);

	_.redisClient.set(`refreshToken.${user.id}`, refreshToken);

	return refreshToken;
}; exports.createRefreshToken = createRefreshToken;