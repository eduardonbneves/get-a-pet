'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var _mongoose = require('mongoose');

const Pet = new (0, _mongoose.Schema)(
	{
		name: {
			type: String,
			required: true,
		},
		birthdate: {
			type: Date,
			required: true,
		},
		weight: {
			type: Number,
			required: true,
		},
		color: {
			type: String,
			required: true,
		},
		images: {
			type: Array,
			required: true,
		},
		available: {
			type: Boolean,
		},
		user: Object,
		adopter: Object,
	},
	{ timestamps: true }
);

exports.default = _mongoose.model('Pet', Pet);
