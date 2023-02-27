import cors from 'cors';
import csurf from 'csurf';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { createClient, RedisClientType } from 'redis';
import swaggerUI from 'swagger-ui-express';

import checkEnv from './helpers/check-env';
import { rateLimiter } from './helpers/rate-limiter';
import userRoutes from './routes/userRoutes';
import swaggerDocs from './swagger.json';

dotenv.config();
checkEnv();

export default class App {
	private express: Application;
	private port = process.env.NODE_PORT|| 3333;
	public redisClient: RedisClientType;

	constructor() {
		this.express = express();
		this.redisClient = createClient({
			url: process.env.REDIS_URL || 'redis://localhost:6379'
		});
		this.middlewares();
		this.routes();
		this.listen();
	}

	private middlewares(): void {
		this.express.use(rateLimiter);
		this.express.use(express.urlencoded({ extended: true }));
		this.express.use(express.json());
		this.express.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
		this.express.use(helmet());
		this.express.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
	}

	private routes(): void {
		this.express.use('/users', userRoutes);
		this.express.use((_: Request, res: Response) => {
			return res.status(404).json({ message: 'Route not found' });
		});
	}

	private async database(): Promise<void> {
		try {
			mongoose.set('strictQuery', false);
			await mongoose.connect(process.env.MONGO_URI as string);
			console.log('Connected to MongoDB');
		} catch (error) {
			console.error('MongoDB -', error);
			process.exit(1);
		}
	}

	private async redis(): Promise<void> {
		try {
			await this.redisClient.connect();
			console.log('Connected to Redis');
		} catch (error) {
			console.error('Redis -', error);
			process.exit(1);
		}
	}

	private async listen(): Promise<void> {
		await this.database();
		await this.redis();
		try {
			this.express.listen(this.port, () => {
				console.log(`API listening on port ${this.port}`);
			});
		} catch (error) {
			console.error('Error starting Express server - ', error);
		}

	}

	public getRedisClient(): RedisClientType {
		return this.redisClient;
	}

	public getApp(): Application {
		return this.express;
	}

}