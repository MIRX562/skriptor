import { Queue } from "bullmq";
import IORedis from "ioredis";

export const redis = new IORedis(process.env.REDIS_URL!);
export const queue = new Queue("transcription", { connection: redis });
