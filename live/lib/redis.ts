import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function redis(): Redis {
  if (!client) {
    client = new Redis({
      url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return client;
}
