import jwt from 'jsonwebtoken';

import User, { UserInterface } from '../models/User';

const getUserByToken = async (authorization: string) => {

	const token = authorization.split(' ')[1];

	const decodedToken = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as UserInterface;

	const user = await User.findById(decodedToken.id) as UserInterface;

	return user;

};

export default getUserByToken;