import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { PostgresDialect } from "kysely"

if ( !process.env.DATABASE_URL ) throw new Error( "DATABASE_URL is not set" )
if ( !process.env.BETTER_AUTH_SECRET ) throw new Error( "BETTER_AUTH_SECRET is not set" )

declare global {
  // eslint-disable-next-line no-var
  var __dmgPgPool: Pool | undefined
}

const ssl =
  process.env.DATABASE_URL.includes( "sslmode=require" ) ||
    process.env.DATABASE_URL.includes( "neon.tech" )
    ? { rejectUnauthorized: false }
    : undefined

const pool =
  global.__dmgPgPool ??
  new Pool( {
    connectionString: process.env.DATABASE_URL,
    ssl,
    max: 5,
  } )

if ( process.env.NODE_ENV !== "production" ) global.__dmgPgPool = pool

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000"

const toOrigin = ( value: string ) => {
  try {
    return new URL( value ).origin
  } catch {
    return value.replace( /\/+$/, "" )
  }
}

const trustedOrigins = Array.from(
  new Set(
    [
      baseURL,
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      ...( process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split( "," ) ?? [] ),
      process.env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined,
      process.env.NODE_ENV !== "production" ? "http://127.0.0.1:3000" : undefined,
    ]
      .filter( ( value ): value is string => Boolean( value?.trim() ) )
      .map( ( value ) => toOrigin( value.trim() ) )
  )
)

export const auth = betterAuth( {
  // Provide an explicit Kysely dialect so Better Auth doesn't rely on runtime detection
  database: { dialect: new PostgresDialect( { pool } ), type: "postgres" },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins,
  emailAndPassword: { enabled: true },
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        required: false,
        fieldName: "stripe_customer_id",
      },
      subscriptionStatus: {
        type: "string",
        required: false,
        defaultValue: "inactive",
        fieldName: "subscription_status",
      },
      credits: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
    },
  },
  session: {
    fields: {
      token: "token",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  account: {
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      idToken: "id_token",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
} )
