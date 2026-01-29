import { Redis } from "@upstash/redis"

const hasRedisEnv = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

const missingRedis = new Proxy( {}, {
  get( _target, prop ) {
    if ( prop === "then" ) return undefined
    return ( ..._args: unknown[] ) => {
      throw new Error( "Missing Upstash Redis environment variables" )
    }
  },
} ) as unknown as Redis

export const redis = hasRedisEnv
  ? new Redis( {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    } )
  : missingRedis
