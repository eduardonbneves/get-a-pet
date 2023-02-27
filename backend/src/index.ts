import App from './app';

const app = new App();
app.getApp();
export const redisClient = app.getRedisClient();