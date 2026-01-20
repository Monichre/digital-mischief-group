
import { auth } from "@/platform/auth/server" // Make sure to import from where you initialized auth
import { toNextJsHandler } from "better-auth/next-js"

export const runtime = "nodejs"

export const { GET, POST } = toNextJsHandler( auth )
