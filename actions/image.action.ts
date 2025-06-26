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
