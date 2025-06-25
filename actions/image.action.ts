"use server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../lib/utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

/**
 * Adds a new image to the database associated with a user.
 *
 * @param {Object} params - Parameters for adding the image.
 * @param {TImage} params.image - The image data to be saved.
 * @param {string} params.userId - The ID of the user adding the image.
 * @param {string} params.path - The path to revalidate after the image is added.
 * @returns {Promise<TImage | null>} - The newly created image or null on failure.
 */
export async function addImage({ image, userId, path }: AddImageParams): Promise<TImage | null> {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) throw new Error("AUTHOR NOT FOUND");

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newImage)) as TImage;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Updates an existing image.
 *
 * @param {Object} params - Parameters for updating the image.
 * @param {TImage} params.image - The updated image data.
 * @param {string} params.userId - The ID of the user performing the update.
 * @param {string} params.path - The path to revalidate after the update.
 * @returns {Promise<TImage | null>} - The updated image or null if unauthorized or not found.
 */
export async function updateImage({ image, userId, path }: UpdateImageParams): Promise<TImage | null> {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate?.author?.toHexString() !== userId) {
      throw new Error("Unauthorized to update this image or not found".toUpperCase());
    }

    const updatedImage = await Image.findByIdAndUpdate(image._id, image, { new: true });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage)) as TImage;
  } catch (error) {
    handleError(error);
    return null;
  }
}

/**
 * Deletes an image from both the database and Cloudinary.
 *
 * @param {string} imageId - The ID of the image to delete.
 * @returns {Promise<void>}
 * @redirects Redirects to the homepage after deletion.
 */
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    const image = await Image.findByIdAndDelete(imageId);

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    await cloudinary.uploader.destroy(image?.publicId as string);
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

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
    handleError(error);
    return null;
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
