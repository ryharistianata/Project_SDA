import Redis from "ioredis"
const redis = new Redis(`rediss://default:${process.env.NEXT_PUBLIC_UPSTASH_REDIS ?? ""}@strong-bedbug-47703.upstash.io:6379`);
export default redis