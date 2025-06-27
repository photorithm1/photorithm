import { getUserById } from "@/data/user.data";
import { NextResponse } from "next/server";

/**
 * @route GET /api/startup/user/[id]
 *
 * Provides user data for a given user ID, intended for startup routines or internal caching.
 *
 * Purpose:
 * - Optimized for use with Next.js server-side fetch and caching.
 * - Enables fast, cacheable access to user data for internal routines.
 *
 * Security:
 * - Only accessible with a valid 'x-internal-secret' header matching the INTERNAL_API_SECRET environment variable.
 * - Not for public or client-side use.
 *
 * Usage:
 * - Used by internal processes or startup routines that benefit from cached user data.
 *
 * Response:
 * - Success:   { data: TUser }
 * - Error:     { errorMessage: string } (with appropriate status code)
 */
export async function GET(request: Request, { params }: SearchParamProps) {
  const authorized = request.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET;
  console.log("cache miss api/startup/user/:id");
  if (!authorized) {
    return NextResponse.json({ errorMessage: "Missing a significant header" }, { status: 401 }); // unauthorized
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ errorMessage: "id not present" }, { status: 400 }); // bad request
  }
  try {
    const user = await getUserById(id);
    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json({ errorMessage: (error as Error).message }, { status: 500 });
  }
}

export type StartupApiUserResponse = {
  data: TUser;
};

export type StartupApiUserErrorResponse = {
  errorMessage: string;
};
