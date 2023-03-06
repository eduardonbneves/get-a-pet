import { Request, NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare module 'express' {
	interface Request {
		uuid?: string;
	}
}

// Middleware function that generates a UUID and stores it in the request object
export function addUuidToRequest(req: Request, res: Response, next: NextFunction) {
	req.uuid = uuidv4();
	next();
}