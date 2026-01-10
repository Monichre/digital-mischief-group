
"use server"

import { auth } from "@/lib/auth"
import { isProMember } from "@/lib/stripe/permissions"
import { headers } from "next/headers"

export async function getUserProStatus() {
  const session = await auth.api.getSession( { headers: await headers() } )

  if ( !session?.user?.id ) {
    return false
  }

  return await isProMember( session.user.id )
}
