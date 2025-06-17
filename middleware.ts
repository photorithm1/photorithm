/**
 * Next.js middleware for handling authentication and route protection.
 *
 * This middleware integrates with Clerk for authentication and defines which routes
 * are public vs protected. Public routes are accessible without authentication,
 * while protected routes require a valid Clerk session.
 *
 * Public Routes:
 * - Authentication pages (/sign-in, /sign-up)
 * - Webhook endpoints (/api/webhooks/*)
 * - Cloudinary cleanup endpoint
 * - Homepage (/)
 * - Transformation pages (/transformations/*)
 *
 * Protected Routes:
 * - All other routes require authentication
 * - Profile and user-specific pages
 * - Credit purchase pages
 *
 * The middleware uses Clerk's authentication system and protects all routes
 * except those explicitly marked as public.
 */

import { clerkMiddleware, ClerkMiddlewareAuth, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/cloudinary/cleanup",
  "/",
  "/transformations(.*)",
]);

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, request: NextRequest) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
