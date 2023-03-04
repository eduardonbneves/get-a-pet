import jwt from 'jsonwebtoken';

import { redisClient } from '..';

import { UserInterface } from '../models/User';

export const createAccessToken = (user: UserInterface, timeout?: string): string => {
	const accessToken = jwt.sign(
		{
			id: user._id
		},
		process.env.JWT_SECRET as string,
		{ expiresIn: timeout || process.env.ACCESS_TOKEN_DURATION || '20s' }
	);

	return accessToken;
};

export const createRefreshToken = async (user: UserInterface): Promise<string> => {
	const refreshToken = jwt.sign(
		{
			id: user._id
		},
	process.env.JWT_SECRET as string,
	{ expiresIn: process.env.REFRESH_TOKEN_DURATION || '1d' }
	);

	redisClient.set(`refreshToken.${user.id}`, refreshToken, { EX: 86400 });

	return refreshToken;
};