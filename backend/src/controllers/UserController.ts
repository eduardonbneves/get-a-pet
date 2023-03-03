import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import validator from 'validator';

import { redisClient } from '..';

import { createAccessToken, createRefreshToken } from '../helpers/create-user-token';
import getUserByToken from '../helpers/get-user-by-token';
import logger from '../helpers/logger';
import { existsEmptyFields, validateUserFields, validatePassword } from '../helpers/validate-user-fields';
import User, { UserInterface } from '../models/User';


class UserController {

	public async register(req: Request, res: Response): Promise<Response> {

		const errorResponse = await validateUserFields(req.body) as [];

		if (errorResponse.length !== 0) {
			return res.status(422).json({ errors: errorResponse });
		}

		try {
			const newUser = await new User({
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				password: req.body.password
			}).save();

			// generated hash password on User Model

			const token = createAccessToken(newUser);
			await createRefreshToken(newUser);

			const response = {
				_id: newUser._id,
				nome: newUser.name,
				email: newUser.email,
				phone: newUser.phone,
				token: token
			};

			return res.status(201).json({
				message: 'User successfully registered and authenticated',
				response
			});
		} catch (error) {
			logger.error(error);
			return res.status(500).json({ message: 'Error registering user' });
		}

	}

	public async login(req: Request, res: Response): Promise<Response> {

		const login = {
			email: req.body.email,
			password: req.body.password
		};

		// check empty fields
		const emptyFields = existsEmptyFields(login);

		if (emptyFields.length !== 0) {
			return res.status(422).json({ message: `Required: ${emptyFields.join(', ')}` });
		}

		// validate email
		if (!validator.isEmail(login.email)) {
			return res.status(422).json({ message: 'Enter a valid email' });
		}

		// check if user exists and if password matches on the User Model
		const user = await User.findOne({ email: login.email });

		if (!user || !await user.passwordsCompare(login.password)) {
			// random delay from 700 to 800 milliseconds
			const delay = 600 + Math.random() * 100;
			await new Promise<never>((resolve) => setTimeout(resolve, delay));

			return res.status(401).json({ message: 'Invalid email or/and password' });
		}

		const token = createAccessToken(user);
		await createRefreshToken(user);

		return res.status(200).json({ message: 'Successfully authenticated', token });

	}

	// to protect
	public async checkUser(req: Request, res: Response): Promise<Response> {

		let currentUser: any;

		const authorization = req.headers.authorization;

		if (!authorization) {
			return res.status(401).json({ message: 'Unauthorized access' });
		}

		try {
			const token = authorization.split(' ')[1];
			const decodedToken = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as UserInterface;

			currentUser = await User.findById(decodedToken.id);

			currentUser.password = undefined;
		} catch (error) {
			logger.error(error);
			return res.status(400).json({ message: 'Invalid token' });
		}

		return res.status(200).json({ currentUser });

	}

	public async getUserById(req: Request, res: Response): Promise<Response> {

		const id = req.params.id;

		const user = await User.findById(id).select('-password');

		if (!user) {
			return res.status(422).json({ message: 'User not found' });
		}

		return res.status(200).json({ user });

	}

	public async editUser(req: Request, res: Response): Promise<Response> {

		const user = await getUserByToken(req.headers.authorization as string);

		const userToEdit = {
			name: req.body.name,
			email: req.body.email,
			phone: req.body.phone,
			password: req.body.password,
			confirmPassword: req.body.confirmPassword,
			image: req.file?.filename
		};

		const response = await validateUserFields(userToEdit, user);

		if (!('name' in response)) {
			return res.status(422).json({ errors: response });
		}

		try {
			await User.findOneAndUpdate(
				{ _id: user._id },
				{ $set: response }
			);

			return res.status(200).json({ message: 'Updated successfully' });
		} catch (error) {
			logger.error(error);
			return res.status(500).json({ message: 'Error in user update' });
		}
	}

	public async refreshToken(req: Request, res: Response): Promise<Response> {

		try {
			// send old refresh token
			const user = await getUserByToken(req.headers.authorization as string);

			const storedRefreshToken = await redisClient.get(`refreshToken.${user.id}`);

			const refreshToken = req.headers.authorization?.split(' ')[1];

			if (storedRefreshToken !== refreshToken) {
				return res.status(401).json({ message: 'Invalid refresh token' });
			}

			await createRefreshToken(user);

			const newAccessToken = createAccessToken(user);

			return res.status(200).json({ newAccessToken });
		} catch (error) {
			logger.error(error);
			return res.status(400).json({ message: 'Invalid refresh token' });
		}
	}

	public async requestNewPassword(req: Request, res: Response): Promise<Response> {

		try {

			const { email } = req.body;

			if (!email) {
				return res.status(422).json({ message: 'Email required' });
			}

			const user = await User.findOne({ email });

			if (!validator.isEmail(email) || !user) {
				return res.status(400).json({ message: 'Invalid email' });
			}

			const token = createAccessToken(user, '1h');

			const transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT as unknown as number,
				secure: true,
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASSWORD
				}
			});

			await transporter.sendMail({
				from: `Get a Pet <no-reply.${process.env.SMTP_USER}>`,
				replyTo: `no-reply.${process.env.SMTP_USER}`,
				priority: 'high',
				to: user.email,
				subject: 'Redefinir senha',
				html:
					`
				<p>Hello, ${user.name}!</p>
				<p>We received a request to reset your password.</p>
				<p>Click on the link below to reset your password:</p>
				<a href="${process.env.BASE_URL || 'http://localhost:3333'}/reset_password/${token}">Reset Password</a>
				<p>If you didn't request account recovery, please ignore this email. This link will expire in 1 hour.</p>
				`
			});

			return res.json({ message: 'Email successfully sent' });

		} catch (error) {
			logger.error(error);
			return res.status(500).json({ message: 'Error sending email' });
		}
	}

	public async resetPassword(req: Request, res: Response): Promise<Response> {

		const { password } = req.body;

		const passwordInvalidations = validatePassword(password);

		if (passwordInvalidations.length !== 0) {
			return res.status(422).json({ errors: passwordInvalidations });
		}

		const user = await getUserByToken(req.headers.authorization as string);

		user.password = password;

		try {
			await user.save();
		} catch (error) {
			logger.error(error);
			return res.status(500).json({ message: 'Error in password update' });
		}

		return res.json({ message: 'Password successfully changed' });
	}

}

export default new UserController();