/**
 * @route GET /api/cloudinary/cleanup
 *
 * Deletes garbage (orphaned) images from Cloudinary.
 *
 * An image is considered garbage if:
 * - It exists in the configured Cloudinary folder.
 * - It is NOT referenced by any document in the `Image` collection in the database.
 *
 * Reason:
 * - Users may upload an image but not complete the action (e.g., form submission),
 *   which results in the image being stored in Cloudinary but not tracked in the DB.
 * - These orphaned images waste cloud storage and should be periodically cleaned up.
 *
 * Cleanup Criteria:
 * - The image must be older than 5 minutes (to allow for delayed saves).
 * - It must not exist in the `Image` model (checked using its `public_id`).
 *
 * Recommended Usage:
 * - Run this route every 5 minutes using a CRON job, GitHub Actions, or a serverless scheduler.
 * - Increase frequency for higher-traffic applications.
 */
import Image from "@/database/models/image.model";
import { v2 as cloudinary, ResourceApiResponse } from "cloudinary";
import { NextResponse } from "next/server";

export async function GET() {
  console.time("cleanup");
  console.log("Cleanup function started...");
  try {
    const images = await Image.find();
    const publicIds: string[] = images.map(image => image.publicId);

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    // Convert to Unix timestamp in seconds (5 minutes ago)
    const fiveMinutesAgo = Math.floor(new Date().getTime() / 1000) - 5 * 60;

    // Search for resources older than 5 minutes
    const { resources } = (await cloudinary.search
      .expression(`folder=${process.env.CLOUDINARY_IMAGE_FOLDER} AND uploaded_at<${fiveMinutesAgo}`)
      .max_results(100)
      .execute()) as ResourceApiResponse;

    // Filter unwanted images which are not available in database
    const filteredPublicIdsToDelete = resources
      .filter(resource => !publicIds.includes(resource.public_id))
      .map(resource => resource.public_id);
    // if no unwanted resources found then cleanup action is not required, simply end the execution
    if (filteredPublicIdsToDelete.length <= 0) {
      return NextResponse.json({ message: "No unwanted resources found" }, { status: 200 });
    }
    console.log("Deleted Cloudinary Public IDs:", filteredPublicIdsToDelete);

    await cloudinary.api.delete_resources(filteredPublicIdsToDelete);

    return NextResponse.json({ message: "Unwanted resources deleted from cloudinary" }, { status: 200 });
  } catch (error) {
    console.timeEnd("cleanup");
    console.log("ERROR IN api/cloudinary/cleanup", error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  } finally {
    console.log("Cleanup function ended...");
    console.timeEnd("cleanup");
  }
}
