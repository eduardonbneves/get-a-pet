import logger from './logger';

export default function checkEnv(): void {
	const requiredEnvs: string[] = [
		'MONGO_URI',
		'JWT_SECRET'
	];
	const emptyEnvs: string[] = [];

	for (const env of requiredEnvs) {
		if (!process.env[env]) {
			logger.error(`${env} environment variable not set`);
			emptyEnvs.push(env);
		}
	}

	if (emptyEnvs.length > 0) {
		process.exit(1);
	}
}