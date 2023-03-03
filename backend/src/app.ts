import compression from 'compression';
import cors from 'cors';
import csurf from 'csurf';
import dotenv from 'dotenv';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { createClient, RedisClientType } from 'redis';
import swaggerUI from 'swagger-ui-express';

import checkEnv from './helpers/check-env';
import logger from './helpers/logger';
import userRoutes from './routes/userRoutes';
import swaggerDocs from './swagger.json';

dotenv.config();
checkEnv();

export class App {
	private express: Application;
	private port = process.env.NODE_PORT|| 3333;
	public redisClient: RedisClientType;

	constructor() {
		this.express = express();
		this.redisClient = createClient({
			url: process.env.REDIS_URL || 'redis://localhost:6379',
			name: 'refresh-token'
		});
		this.redis();
		this.database();
		this.middlewares();
		this.routes();
		this.listen();
	}

	private middlewares(): void {
		this.express.use(helmet());
		this.express.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
		this.express.use(compression());
		this.express.use(express.urlencoded({ extended: true }));
		this.express.use(express.json());
		this.express.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
	}

	private routes(): void {
		this.express.get('/test', (req, res) => {
			res.status(200).json({ message: 'deu certo' });
		});
		this.express.use('/users', userRoutes);
		this.express.use((_: Request, res: Response) => {
			return res.status(404).json({ message: 'Route not found' });
		});
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		this.express.use((error: Error, _: Request, res: Response, next: NextFunction) => {
			logger.error(error);
			return res.status(500).json({ message: error.message });
		});
	}

	private async redis(): Promise<void> {
		try {
			await this.redisClient.connect();
			logger.info('Connected to Redis');
		} catch (error) {
			logger.error(error);
			process.exit(1);
		}
	}

	private async database(): Promise<void> {
		try {
			mongoose.set('strictQuery', false);
			await mongoose.connect(process.env.MONGO_URI as string);
			logger.info('Connected to MongoDB');
		} catch (error) {
			logger.error(error);
			process.exit(1);
		}
	}


	private async listen(): Promise<void> {
		try {
			this.express.listen(this.port, () => {
				logger.info(`API listening on port ${this.port}`);
			});
		} catch (error) {
			logger.error(error);
		}

	}

	public getRedisClient(): RedisClientType {
		return this.redisClient;
	}

	public getApp(): Application {
		return this.express;
	}

}