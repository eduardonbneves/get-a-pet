import { Router } from 'express';

import UserController from '../controllers/UserController';
import { authUserByToken } from '../helpers/auth-user-by-token';
import { rateLimiter } from '../helpers/rate-limiter';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', rateLimiter, UserController.login);
// to protect
router.get('/checkuser', UserController.checkUser);
router.get('/:id', UserController.getUserById);
router.patch('/edit', authUserByToken, UserController.editUser);
router.post('/refresh_token', UserController.refreshToken);
router.post('/forgot_password', rateLimiter, UserController.requestNewPassword);
router.post('/reset_password', authUserByToken, UserController.resetPassword);

export default router;