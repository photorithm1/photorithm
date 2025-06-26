import { getAllImages } from "@/data/image.data";
import { NextResponse } from "next/server";

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
