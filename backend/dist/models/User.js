'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var _mongoose = require('mongoose');

const User = new (0, _mongoose.Schema)(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
		phone: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

exports.default = _mongoose.model('User', User);
