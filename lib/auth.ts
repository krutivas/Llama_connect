import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SESSION_COOKIE_NAME = 'llama_session';

/**
 * Get the current user from the session cookie
 * Returns null if no valid session exists
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  // Find session and include user + subscription
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: {
        include: {
          subscription: true,
        },
      },
    },
  });

  // Check if session exists and hasn't expired
  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

/**
 * Check if the current user has an active subscription
 * Returns true if subscription is active or trialing and not expired
 */
export async function hasActiveSubscription() {
  const user = await getCurrentUser();
  
  if (!user || !user.subscription) {
    return false;
  }

  const { status, currentPeriodEnd } = user.subscription;
  
  // Check if status is active or trialing
  const validStatuses = ['active', 'trialing'];
  if (!validStatuses.includes(status)) {
    return false;
  }

  // Check if period hasn't ended
  if (currentPeriodEnd && currentPeriodEnd < new Date()) {
    return false;
  }

  return true;
}

/**
 * Create a new session for a user
 * Returns the session token
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Generate a random session token
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2) + 
         Date.now().toString(36) + 
         Math.random().toString(36).substring(2);
}
