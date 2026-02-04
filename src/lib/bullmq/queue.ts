import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { redisOpts } from './redisConfig';

const connection = new IORedis(redisOpts);
console.log("Connecting to Redis host:", redisOpts.host);
export const jobQueue = new Queue('multi-job-queue', { connection });
