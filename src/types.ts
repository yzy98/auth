import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { GET_ACTION, POST_ACTION } from "./constants";
import type { session as sessionSchema, user as userSchema } from "./db/schema";

/**
 * Represents a session entity from the database
 * Contains session metadata including expiration and creation timestamps
 */
export type Session = typeof sessionSchema.$inferSelect;

/**
 * Represents a user entity from the database
 * Contains user information including authentication credentials
 */
export type User = typeof userSchema.$inferSelect;

/**
 * A subset of user data suitable for client-side consumption
 * Excludes sensitive information like passwords
 * Fields are optional to accommodate different use cases
 */
export type PickedUser = Pick<User, "id" | "name" | "email">;

/**
 * Configuration object for initializing the auth instance
 * Requires a database connection for persistence operations
 */
export type AuthConfig = {
  /** Database instance for storing users and sessions */
  db: NeonHttpDatabase;
};

/**
 * Parameters required for user registration
 * Name is optional, email and password are required
 */
export type SignUpParams = {
  /** User's display name (optional) */
  name?: string;
  /** User's email address (required, must be unique) */
  email: string;
  /** User's password (required, will be hashed) */
  password: string;
};

/**
 * Parameters required for user authentication
 * Both email and password are required for sign-in
 */
export type SignInParams = {
  /** User's registered email address */
  email: string;
  /** User's password for authentication */
  password: string;
};

/**
 * Callback functions for handling auth operation results
 * Provides success and error handling hooks for async operations
 */
export type Callback = {
  /**
   * Called when the operation completes successfully
   * @param user The authenticated user data (optional)
   * @returns void
   */
  onSuccess?: (user?: PickedUser) => void;
  /**
   * Called when the operation fails with an error
   * @param error The error that occurred (optional)
   * @returns void
   */
  onError?: (error?: Error) => void;
};

/** Callback type specifically for sign-up operations */
export type SignUpCallback = Callback;
/** Callback type specifically for sign-in operations */
export type SignInCallback = Callback;
/** Callback type specifically for sign-out operations */
export type SignOutCallback = Callback;

/**
 * Represents a successful operation result
 * Contains the data payload and no error
 */
export type Success<T> = {
  /** The successful result data */
  data: T;
  /** Always null for successful operations */
  error: null;
};

/**
 * Represents a failed operation result
 * Contains no data and an error object
 */
export type Failure<E> = {
  /** Always null for failed operations */
  data: null;
  /** The error that caused the operation to fail */
  error: E;
};

/**
 * A discriminated union type representing the result of an operation
 * Can be either a Success with data or a Failure with error
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Data structure returned by sign operations (sign-up, sign-in, sign-out)
 * Contains the authenticated user information
 */
export type SignActionData = {
  /** The user object with non-sensitive information */
  user: PickedUser;
};

/**
 * Data structure returned when retrieving a session
 * Contains both user information and session metadata
 */
export type GetSessionData = {
  /** The authenticated user information */
  user: PickedUser;
  /** The session metadata including expiration */
  session: Session;
};

/**
 * Result type for sign operations (sign-up, sign-in, sign-out)
 * Returns either SignActionData on success or Error on failure
 */
export type SignActionResult = Result<SignActionData>;

/**
 * Server-side authentication instance interface
 * Provides methods for user authentication and session management
 */
export type AuthInstance = {
  /**
   * Registers a new user account
   * @param params User registration parameters
   * @param callback Optional success/error callbacks
   * @returns Promise with sign operation result
   */
  signUp: (
    params: SignUpParams,
    callback?: SignUpCallback
  ) => Promise<SignActionResult>;

  /**
   * Authenticates an existing user
   * @param params User credentials for authentication
   * @param callback Optional success/error callbacks
   * @returns Promise with sign operation result
   */
  signIn: (
    params: SignInParams,
    callback?: SignInCallback
  ) => Promise<SignActionResult>;

  /**
   * Terminates the current user session
   * @param callback Optional success/error callbacks
   * @returns Promise with sign operation result
   */
  signOut: (callback?: SignOutCallback) => Promise<SignActionResult>;

  /**
   * Retrieves the current authenticated session
   * @returns Promise with session data or error
   */
  getSession: () => Promise<Result<GetSessionData>>;
};

/**
 * Client-side hook result for session management
 * Provides reactive session state with loading and error states
 */
export type UseSessionResult = {
  /** The current session data, null if not authenticated */
  data: GetSessionData | null;
  /** Error object if session retrieval failed */
  error: Error | null;
  /** Loading state indicating if session is being fetched */
  isLoading: boolean;
  /** Function to manually refetch the session data */
  refetch: () => Promise<void>;
};

/**
 * Client-side result type for sign operations
 * Uses string error messages instead of Error objects for better serialization
 */
export type SignActionClientResult = Result<SignActionData, string>;

/**
 * Client-side authentication instance interface
 * Provides methods for client-side auth operations with React hook support
 */
export type AuthClientInstance = {
  /**
   * Client-side user registration
   * @param params User registration parameters
   * @param callback Optional success/error callbacks
   * @returns Promise with client-friendly sign result
   */
  signUp: (
    params: SignUpParams,
    callback?: SignUpCallback
  ) => Promise<SignActionClientResult>;

  /**
   * Client-side user authentication
   * @param params User credentials for authentication
   * @param callback Optional success/error callbacks
   * @returns Promise with client-friendly sign result
   */
  signIn: (
    params: SignInParams,
    callback?: SignInCallback
  ) => Promise<SignActionClientResult>;

  /**
   * Client-side session termination
   * @param callback Optional success/error callbacks
   * @returns Promise with client-friendly sign result
   */
  signOut: (callback?: SignOutCallback) => Promise<SignActionClientResult>;

  /**
   * React hook for accessing and managing session state
   * @returns Reactive session state with loading and error handling
   */
  useSession: () => UseSessionResult;
};

/**
 * Union type of all available POST actions for API routes
 * Used for type-safe API endpoint handling
 */
export type PostAction = (typeof POST_ACTION)[keyof typeof POST_ACTION];

/**
 * Union type of all available GET actions for API routes
 * Used for type-safe API endpoint handling
 */
export type GetAction = (typeof GET_ACTION)[keyof typeof GET_ACTION];

/**
 * Response type for sign operations in API routes
 * Can return either user data on success or error message on failure
 * Designed for JSON serialization in HTTP responses
 */
export type SignActionResponse =
  | {
      /** User data returned on successful operation */
      user: PickedUser;
    }
  | {
      /** Error message returned on failed operation */
      error: string;
    };

/**
 * Response type for session retrieval in API routes
 * Returns session data or null if no active session exists
 */
export type GetSessionResponse = {
  /** Session data or null if not authenticated */
  session: GetSessionData | null;
};
