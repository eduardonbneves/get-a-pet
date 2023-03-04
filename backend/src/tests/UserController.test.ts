import express, { Application } from 'express';
import request from 'supertest';

import { App } from '../app';
import UserController from '../controllers/UserController';
import logger from '../helpers/logger';
import userRoutes from '../routes/userRoutes';

describe('userRoutes', () => {

	let app: Application;

	beforeAll(async () => {
		app = express();
		app.use(express.urlencoded({ extended: true }));
		app.use(express.json());
		app.get('/test', (req, res) => {
			res.status(200).json({ message: 'deu certo' });
		});
		// app.use('/users', userRoutes);
		app.post('/login', UserController.login);
	});

	// describe('test route', () => {
	// 	it('should return a valid route test', async () => {
	// 		const res = await request(app)
	// 			.get('/test')
	// 			.expect(200);

	// 		expect(res.body).toHaveProperty('message');
	// 	});
	// });

	// describe('test route 2', () => {
	// 	it('should return a valid route test', async () => {
	// 		const res = await request(app)
	// 			.get('/users/test')
	// 			.expect(200);

	// 		expect(res.body).toHaveProperty('message');
	// 	});
	// });

	describe('POST /users/login', () => {
		it('should return a token for a valid user', async () => {
			const res = await request(app)
				.post('/login')
				.send({
					email: 'eduardonbneves@gmail.com',
					password: 'examplePassword@12'
				})
				.expect(200);

			expect(res.body).toHaveProperty('token');
		});

		// 	it('should return an error for an invalid user', async () => {
		// 		const res = await request(app)
		// 			.post('/users/login')
		// 			.send({
		// 				email: 'invalid@example.com',
		// 				password: 'invalidpassword'
		// 			})
		// 			.expect(401);

	// 		expect(res.body).toHaveProperty('message', 'Invalid email or password');
	// 	});
	});
});