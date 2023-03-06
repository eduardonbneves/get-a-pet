import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User, { UserInterface } from '../models/User';
import logger from './logger';

declare module 'express' {
	interface Request {
		userId?: string;
	}
}


export const authUserByToken = async (req: Request, res: Response, next: NextFunction) => {

	const authorization = req.headers.authorization;

	if (!authorization) {
		return res.status(401).json({ error: 'Unauthorized access' });
	}

	const token = authorization.split(' ')[1];

	try {

		const decodedToken = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as UserInterface;

		const user = await User.findById(decodedToken.id);

		if (!user) {
			return res.status(400).json({ message: 'User not found' });
		}

		req.userId = user.id;

		return next();

	} catch (error) {

		logger.error(error);

		return res.status(400).json({ message: 'Invalid token' });

	}

};