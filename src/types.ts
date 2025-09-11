import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { session, user } from "./schemas";

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;

export type AuthConfig = {
  db: NeonHttpDatabase;
};

export type SignUpParams = {
  name?: string;
  email: string;
  password: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

export type AuthInstance = {
  signUp: (params: SignUpParams) => Promise<void>;
  signIn: (params: SignInParams) => Promise<void>;
  signOut: () => Promise<void>;
  getSession: () => Promise<{
    user: Pick<User, "name" | "email">;
    session: Session;
  } | null>;
};
