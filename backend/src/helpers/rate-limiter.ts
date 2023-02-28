import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const client = createClient({
	url: process.env.REDIS_URL || 'redis://localhost:6379',
	name: 'rate-limiter',
	database: 1
});

client.connect();

export const rateLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	handler: (req: Request, res: Response, next: NextFunction, options) =>
		res.status(options.statusCode).json({ message: options.message }),
	store: new RedisStore({
		prefix: 'rate-limit:',
		sendCommand: (...args: string[]) => client.sendCommand(args)
	})
});