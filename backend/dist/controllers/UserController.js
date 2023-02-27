'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

class UserController {
	async register(req, res) {
		// const user = await User.create(req.body);

		console.log(req.csrfToken());

		return res.json({
			message: 'cadastrado com sucesso',
			csrfToken: req.csrfToken(),
		});
	}
}

exports.default = new UserController();
