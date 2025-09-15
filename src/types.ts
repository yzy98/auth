import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { session as sessionSchema, user as userSchema } from "./schemas";

export type Session = typeof sessionSchema.$inferSelect;
export type User = typeof userSchema.$inferSelect;
export type PickedUser = Pick<User, "id" | "name" | "email">;

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

export type Callback = {
  onSuccess?: (user?: PickedUser) => void;
  onError?: (error?: Error) => void;
};

export type SignUpCallback = Callback;
export type SignInCallback = Callback;
export type SignOutCallback = Callback;

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

type SignActionData = {
  user: PickedUser;
};

export type GetSessionData = {
  user: PickedUser;
  session: Session;
};

export type SignActionResult = Result<SignActionData>;

export type AuthInstance = {
  signUp: (
    params: SignUpParams,
    callback?: SignUpCallback
  ) => Promise<SignActionResult>;
  signIn: (
    params: SignInParams,
    callback?: SignInCallback
  ) => Promise<SignActionResult>;
  signOut: (callback?: SignOutCallback) => Promise<SignActionResult>;
  getSession: () => Promise<Result<GetSessionData>>;
};

export type UseSessionResult = {
  data: GetSessionData | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

type SignActionClientResult = Result<SignActionData, string>;

export type AuthClientInstance = {
  signUp: (
    params: SignUpParams,
    callback?: SignUpCallback
  ) => Promise<SignActionClientResult>;
  signIn: (
    params: SignInParams,
    callback?: SignInCallback
  ) => Promise<SignActionClientResult>;
  signOut: (callback?: SignOutCallback) => Promise<SignActionClientResult>;
  useSession: () => UseSessionResult;
};
