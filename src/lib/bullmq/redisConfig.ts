import IORedis from 'ioredis';

console.log('REDIS_HOST =', process.env.NEXT_PUBLIC_REDIS_HOST);
export const redisOpts = {
  host: process.env.NEXT_PUBLIC_REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.NEXT_PUBLIC_REDIS_PORT || '6379'),
  db: 0,
  maxRetriesPerRequest: null,
};

console.log('👉 Connecting to Redis with:', redisOpts);

export const redis = new IORedis(redisOpts);
