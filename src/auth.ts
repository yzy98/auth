import { compare, hash } from "bcryptjs";
import { eq, getTableColumns } from "drizzle-orm";
import { cookies } from "next/headers";
import { session as sessionSchema, user as userSchema } from "./schemas";
import type {
  AuthConfig,
  AuthInstance,
  SignInCallback,
  SignInParams,
  SignOutCallback,
  SignUpCallback,
  SignUpParams,
  User,
} from "./types";

const hashPassword = async (password: string) => {
  return await hash(password, 10);
};

const verifyPassword = async (password: string, hashedPassword: string) => {
  return await compare(password, hashedPassword);
};

export const createAuth = ({ db }: AuthConfig): AuthInstance => {
  const signUp = async (
    { name, email, password }: SignUpParams,
    { onSuccess, onError }: SignUpCallback = {}
  ) => {
    let createdUser: User | undefined;

    try {
      // Check if user already exists
      const [matchedUser] = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, email));

      if (matchedUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await hashPassword(password);

      // Create user
      [createdUser] = await db
        .insert(userSchema)
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
        .insert(sessionSchema)
        .values({
          expiresAt,
          userId: createdUser.id,
        })
        .returning();

      // Set-Cookie in response header
      const cookieStore = await cookies();
      cookieStore.set("yzy98-auth.session_id", createdSession.id, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
      });
    } catch (error) {
      onError?.(error as Error);
      return { data: null, error: error as Error };
    }

    const returnedUser = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    };

    // Call onSuccess callback
    onSuccess?.(returnedUser);

    return { data: { user: returnedUser }, error: null };
  };

  const signIn = async (
    { email, password }: SignInParams,
    { onSuccess, onError }: SignInCallback = {}
  ) => {
    let matchedUser: User | undefined;

    try {
      // Find user
      [matchedUser] = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, email));

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
        .insert(sessionSchema)
        .values({
          expiresAt,
          userId: matchedUser.id,
        })
        .returning();

      // Set-Cookie in response header
      const cookieStore = await cookies();
      cookieStore.set("yzy98-auth.session_id", createdSession.id, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
      });
    } catch (error) {
      onError?.(error as Error);
      return { data: null, error: error as Error };
    }

    const returnedUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
    };

    // Call onSuccess callback
    onSuccess?.(returnedUser);

    return { data: { user: returnedUser }, error: null };
  };

  const signOut = async ({ onSuccess, onError }: SignOutCallback = {}) => {
    let signedOutUser: User | undefined;

    try {
      // Get session id from cookie
      const cookieStore = await cookies();
      const sessionId = cookieStore.get("yzy98-auth.session_id")?.value;

      if (!sessionId) {
        throw new Error("Session id is not valid");
      }

      [signedOutUser] = await db
        .select({
          ...getTableColumns(userSchema),
        })
        .from(sessionSchema)
        .innerJoin(userSchema, eq(sessionSchema.userId, userSchema.id))
        .where(eq(sessionSchema.id, sessionId));

      if (!signedOutUser) {
        throw new Error("User is not exist in database");
      }

      // Delete session in database
      const [deletedSession] = await db
        .delete(sessionSchema)
        .where(eq(sessionSchema.id, sessionId))
        .returning();

      if (!deletedSession) {
        throw new Error("Session is not exist in database");
      }

      // Delete cookie in client
      cookieStore.delete("yzy98-auth.session_id");
    } catch (error) {
      onError?.(error as Error);
      return { data: null, error: error as Error };
    }

    const returnedUser = {
      id: signedOutUser.id,
      name: signedOutUser.name,
      email: signedOutUser.email,
    };

    // Call onSuccess callback
    onSuccess?.(returnedUser);

    return { data: { user: returnedUser }, error: null };
  };

  const getSession = async () => {
    try {
      // Get session id from cookie
      const cookieStore = await cookies();
      const sessionId = cookieStore.get("yzy98-auth.session_id")?.value;

      if (!sessionId) {
        throw new Error("Session id is not exist in cookie");
      }

      // Find session and related user in database
      const [matchedSession] = await db
        .select({
          user: {
            name: userSchema.name,
            email: userSchema.email,
            id: userSchema.id,
          },
          session: sessionSchema,
        })
        .from(sessionSchema)
        .innerJoin(userSchema, eq(sessionSchema.userId, userSchema.id))
        .where(eq(sessionSchema.id, sessionId));

      if (!matchedSession) {
        throw new Error("Session is not exist in database");
      }

      // Check if session has expired
      if (matchedSession.session.expiresAt < new Date()) {
        // Delete expired session
        await db.delete(sessionSchema).where(eq(sessionSchema.id, sessionId));
        // Delete cookie
        cookieStore.delete("yzy98-auth.session_id");
        throw new Error("Session is expired");
      }

      return { data: matchedSession, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    getSession,
  };
};

// [TODO] Fix the db type for peerDependencies
