import { useCallback, useEffect, useState } from "react";
import type {
  GetSessionResponse,
  SignActionResponse,
} from "../integrations/next-js";
import type {
  AuthClientInstance,
  GetSessionData,
  SignInCallback,
  SignInParams,
  SignOutCallback,
  SignUpCallback,
  SignUpParams,
  UseSessionResult,
} from "../types";

export const createAuthClient = (): AuthClientInstance => {
  const signUp = async (
    { name, email, password }: SignUpParams,
    { onSuccess, onError }: SignUpCallback = {}
  ) => {
    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const result = (await response.json()) as SignActionResponse;

    if ("error" in result) {
      onError?.(new Error(result.error));
      return { data: null, error: result.error };
    }

    onSuccess?.(result.user);
    return { data: { user: result.user }, error: null };
  };

  const signIn = async (
    { email, password }: SignInParams,
    { onSuccess, onError }: SignInCallback = {}
  ) => {
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const result = (await response.json()) as SignActionResponse;

    if ("error" in result) {
      onError?.(new Error(result.error));
      return { data: null, error: result.error };
    }

    onSuccess?.(result.user);
    return { data: { user: result.user }, error: null };
  };

  const signOut = async ({ onSuccess, onError }: SignOutCallback = {}) => {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = (await response.json()) as SignActionResponse;

    if ("error" in result) {
      onError?.(new Error(result.error));
      return { data: null, error: result.error };
    }

    onSuccess?.(result.user);
    return { data: { user: result.user }, error: null };
  };

  // [TODO]: Improve type definition and error handling
  // [TODO]: Test useSession
  const useSession = (): UseSessionResult => {
    const [data, setData] = useState<GetSessionData | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSession = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/auth/get-session", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status}`);
        }

        const result = (await response.json()) as GetSessionResponse;
        setData(result.session);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchSession();
    }, [fetchSession]);

    return {
      data,
      error,
      isLoading,
      refetch: fetchSession,
    };
  };

  return {
    signUp,
    signIn,
    signOut,
    useSession,
  };
};
