import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { session, user } from "./schemas";
import type {
  AuthConfig,
  AuthInstance,
  SignInParams,
  SignUpParams,
} from "./types";

const hashPassword = async (password: string) => {
  return await hash(password, 10);
};

const verifyPassword = async (password: string, hashedPassword: string) => {
  return await compare(password, hashedPassword);
};

export const createAuth = ({ db }: AuthConfig): AuthInstance => {
  const signUp = async ({ name, email, password }: SignUpParams) => {
    const hashedPassword = await hashPassword(password);

    // Create user
    const [createdUser] = await db
      .insert(user)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    // Expire in 1 day
    // biome-ignore lint/style/noMagicNumbers: magic number
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    // Create session
    const [createdSession] = await db
      .insert(session)
      .values({
        expiresAt,
        userId: createdUser.id,
      })
      .returning();

    // Set-Cookie in response header
    const cookieStore = await cookies();
    cookieStore.set("yzy98-auth", createdSession.id, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
  };

  const signIn = async ({ email, password }: SignInParams) => {
    // Find user
    const [matchedUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!matchedUser) {
      throw new Error("Email is not valid");
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      password,
      matchedUser.password
    );

    if (!isPasswordValid) {
      throw new Error("Password is not valid");
    }

    // Expire in 1 day
    // biome-ignore lint/style/noMagicNumbers: magic number
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    // Create session
    const [createdSession] = await db
      .insert(session)
      .values({
        expiresAt,
        userId: matchedUser.id,
      })
      .returning();

    // Set-Cookie in response header
    const cookieStore = await cookies();
    cookieStore.set("yzy98-auth", createdSession.id, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
  };

  const signOut = async () => {
    // Get session id from cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("yzy98-auth")?.value;

    if (!sessionId) {
      throw new Error("Session id is not valid");
    }

    // Delete session in database
    await db.delete(session).where(eq(session.id, sessionId));

    // Delete cookie in client
    cookieStore.delete("yzy98-auth");
  };

  const getSession = async () => {
    // Get session id from cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("yzy98-auth")?.value;

    if (!sessionId) {
      return null;
    }

    // Find session and related user in database
    const [matchedSession] = await db
      .select({
        user: {
          name: user.name,
          email: user.email,
        },
        session,
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(eq(session.id, sessionId));

    if (!matchedSession) {
      return null;
    }

    // Check if session has expired
    if (matchedSession.session.expiresAt < new Date()) {
      // Delete expired session
      await db.delete(session).where(eq(session.id, sessionId));
      // Delete cookie
      cookieStore.delete("yzy98-auth");
      return null;
    }

    return matchedSession;
  };

  return {
    signUp,
    signIn,
    signOut,
    getSession,
  };
};

// [TODO] Fix the db type for peerDependencies
// [TODO] Add client side useAuth hook
