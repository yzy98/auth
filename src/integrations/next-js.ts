import { type NextRequest, NextResponse } from "next/server";
import { GET_ACTION, POST_ACTION } from "../constants";
import type {
  AuthInstance,
  GetAction,
  GetSessionResponse,
  PostAction,
  SignActionResponse,
  SignInParams,
  SignUpParams,
} from "../types";

export const NextJsRouter = (auth: AuthInstance) => {
  const handleSignUp = async (
    request: NextRequest
  ): Promise<NextResponse<SignActionResponse>> => {
    const body = (await request.json()) as SignUpParams;

    if (!(body.email && body.password)) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await auth.signUp({ ...body });

    if (result.error) {
      return NextResponse.json(
        { error: result.error?.message || "Sign up failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ user: result.data.user }, { status: 200 });
  };

  const handleSignIn = async (
    request: NextRequest
  ): Promise<NextResponse<SignActionResponse>> => {
    const body = (await request.json()) as SignInParams;

    if (!(body.email && body.password)) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await auth.signIn({ ...body });

    if (result.error) {
      return NextResponse.json(
        { error: result.error?.message || "Sign In failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ user: result.data.user }, { status: 200 });
  };

  const handleSignOut = async (): Promise<NextResponse<SignActionResponse>> => {
    const result = await auth.signOut();

    if (result.error) {
      return NextResponse.json(
        { error: result.error?.message || "Sign Out failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ user: result.data.user }, { status: 200 });
  };

  const handleGetSession = async (): Promise<
    NextResponse<GetSessionResponse>
  > => {
    const result = await auth.getSession();
    if (result.error) {
      return NextResponse.json({ session: null }, { status: 200 });
    }
    return NextResponse.json({ session: result.data }, { status: 200 });
  };

  const postHandler = async (
    request: NextRequest,
    { params }: { params: Promise<{ all: string[] }> }
  ) => {
    try {
      const action = (await params).all[0] as PostAction;

      switch (action) {
        case POST_ACTION.SIGN_UP:
          return await handleSignUp(request);
        case POST_ACTION.SIGN_IN:
          return await handleSignIn(request);
        case POST_ACTION.SIGN_OUT:
          return await handleSignOut();
        case POST_ACTION.GET_SESSION:
          return await handleGetSession();
        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
    }
  };

  const getHandler = async (
    _request: NextRequest,
    { params }: { params: Promise<{ all: string[] }> }
  ) => {
    try {
      const action = (await params).all[0] as GetAction;

      if (action === GET_ACTION.GET_SESSION) {
        return await handleGetSession();
      }
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
    }
  };

  return { POST: postHandler, GET: getHandler };
};
