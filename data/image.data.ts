import Image from "@/database/models/image.model";
import User from "@/database/models/user.model";
import { connectToDatabase } from "@/database/mongoose";
import { handleError } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";

/**
 * Retrieves a single image by its ID, including author information.
 *
 * @param {string} imageId - The ID of the image to retrieve.
 * @returns {Promise<TImage | null>} - The image object or null if not found.
 */
export async function getImageById(imageId: string): Promise<TImage | null> {
  try {
    await connectToDatabase();

    const image = await Image.findById(imageId).populate("author", "clerkId");
    if (!image) throw new Error("IMAGE NOT FOUND");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Fetches all public images from Cloudinary and the database.
 *
 * @param limit - Number of images per page (default: 6).
 * @param page - Page number for pagination (default: 1).
 * @param searchQuery - Optional search keyword.
 * @returns List of images, total pages, and saved count or null on failure.
 */
export async function getAllImages({
  limit = 6,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page?: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = `folder=${process.env.CLOUDINARY_IMAGE_FOLDER}`;

    if (searchQuery) {
      expression += ` AND '%${searchQuery}%'`;
    }
    const { resources } = await cloudinary.search.expression(expression).execute();

    const resourcesIds = resources.map((resource: { public_id: string }) => resource.public_id);
    const skipAmount = (Number(page) - 1) * limit;

    const images = await Image.find({
      publicId: {
        $in: resourcesIds,
      },
      isPrivate: false,
    })
      .populate({
        path: "author",
        model: User,
        select: "_id firstName lastName clerkId",
      })
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)) as TImage[],
      totalImages: Math.ceil(savedImages / limit),
      savedImages,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Retrieves images uploaded by a specific user.
 *
 * @param userId - ID of the user.
 * @param page - Page number (default: 1).
 * @param limit - Number of images per page (default: 9).
 * @returns Paginated user image data or null on error.
 */
export async function getUserImages({ limit = 9, page = 1, userId }: { limit?: number; page: number; userId: string }) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await Image.find({ author: userId })
      .populate({
        path: "author",
        model: User,
        select: "_id firstName lastName clerkId",
      })
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)) as TImage[],
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Gets the total number of images uploaded by a user.
 *
 * @param userId - The user's ID.
 * @returns Number of images or null on failure.
 */
export async function getUserImagesCount(userId: string) {
  try {
    await connectToDatabase();
    return Image.countDocuments({ author: userId });
  } catch (error) {
    console.log("ERROR IN GETUSERIMAGES");
    handleError(error);
    return null;
  }
}
