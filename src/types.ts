import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { session as sessionSchema, user as userSchema } from "./schemas";

export type Session = typeof sessionSchema.$inferSelect;
export type User = typeof userSchema.$inferSelect;

export type AuthConfig = {
  db: NeonHttpDatabase;
};

export type SignUpParams = {
  name?: string;
  email: string;
  password: string;
};

export type Callback = {
  onSuccess?: (user?: Pick<User, "id" | "name" | "email">) => void;
  onError?: (error?: Error) => void;
};

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpCallback = Callback;
export type SignInCallback = Callback;
export type SignOutCallback = Callback;

export type AuthInstance = {
  signUp: (params: SignUpParams, callback?: SignUpCallback) => Promise<void>;
  signIn: (params: SignInParams, callback?: SignInCallback) => Promise<void>;
  signOut: (callback?: SignOutCallback) => Promise<void>;
  getSession: () => Promise<{
    user: Pick<User, "name" | "email">;
    session: Session;
  } | null>;
};
