// TODO: Implement proper authentication (e.g., NextAuth, Clerk, Supabase Auth)
// For MVP, using a simple placeholder user ID

const PLACEHOLDER_USER_ID = 'local'

export function getCurrentUserId(): string {
  // TODO: Replace with actual auth logic
  // Example with NextAuth:
  // const session = await getServerSession()
  // return session?.user?.id ?? null

  return PLACEHOLDER_USER_ID
}

export async function requireAuth(): Promise<string> {
  const userId = getCurrentUserId()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return userId
}
