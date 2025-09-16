/**
 * Constants for POST action types used in API routes
 * These values correspond to the server-side auth operations
 */
export const POST_ACTION = {
  /** Action for user registration */
  SIGN_UP: "sign-up",
  /** Action for user authentication */
  SIGN_IN: "sign-in",
  /** Action for session termination */
  SIGN_OUT: "sign-out",
  /** Action for session retrieval (via POST for consistency) */
  GET_SESSION: "get-session",
};

/**
 * Constants for GET action types used in API routes
 * Currently only supports session retrieval via GET
 */
export const GET_ACTION = {
  /** Action for session retrieval via GET request */
  GET_SESSION: "get-session",
};
