import { getAllImages } from "@/data/image.data";
import { NextResponse } from "next/server";

/**
 * @route GET /api/startup/image
 *
 * Provides a fixed set of images (up to 6) for the home page's initial load.
 *
 * Purpose:
 * - Optimized for speed and caching; does NOT support pagination or search queries.
 * - Used by Next.js server-side fetch with revalidation for fast, cacheable home page data.
 * - Intended to accelerate home page render by serving pre-fetched, cacheable data.
 *
 * Security:
 * - Only accessible with a valid 'x-internal-secret' header matching the INTERNAL_API_SECRET environment variable.
 * - Not for public or client-side use.
 *
 * Usage:
 * - Used by the home page (app/(root)/page.tsx) for initial data load.
 * - For paginated or searched data, the app uses direct data fetching functions from the data/ directory.
 *
 * Response:
 * - Success:   { data: { data: TImage[], totalImages: number, savedImages: number } }
 * - Error:     { errorMessage: string } (with appropriate status code)
 */
export async function GET(request: Request) {
  const authorized = request.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET;
  console.log("cache miss api/startup/image");
  if (!authorized) {
    return NextResponse.json({ errorMessage: "Missing a significant header" }, { status: 401 }); // unauthorized
  }
  try {
    const images = await getAllImages({ limit: 6, page: 1, searchQuery: "" });
    return NextResponse.json({ data: images });
  } catch (error) {
    return NextResponse.json({ errorMessage: (error as Error).message }, { status: 500 });
  }
}

export type StartupApiImageResponse = {
  data: { data: TImage[]; totalImages: number; savedImages: number };
};

export type StartupApiImageErrorResponse = {
  errorMessage: string;
};
