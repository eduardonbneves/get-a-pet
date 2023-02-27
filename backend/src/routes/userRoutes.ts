import { Router } from 'express';

import UserController from '../controllers/UserController';
import { authUserByToken } from '../helpers/auth-user-by-token';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/checkuser', UserController.checkUser);
router.get('/:id', UserController.getUserById);
router.patch('/edit', authUserByToken, UserController.editUser);
router.post('/refresh-token', UserController.refreshToken);
router.post('/forgot-password', UserController.requestNewPassword);

export default router;