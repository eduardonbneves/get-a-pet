"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);
var _mongoose = require('mongoose');










const User = new (0, _mongoose.Schema)(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		image: {
			type: String
		},
		phone: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		}
	},
	{ timestamps: true }
);

User.pre('save', async function () {
	const salt = await _bcryptjs2.default.genSalt(13);
	this.password = await _bcryptjs2.default.hash(this.password, salt);
});

User.methods.passwordsCompare = async function (password) {
	return await _bcryptjs2.default.compare(password, this.password);
};

exports. default = _mongoose.model('User', User);
