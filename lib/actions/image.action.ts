"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

// Add image
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) throw new Error("AUTHOR NOT FOUND");

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}

// Update image
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate?.author?.toHexString() !== userId) {
      throw new Error("Unauthorized to update this image or not found".toUpperCase());
    }

    const updatedImage = await Image.findByIdAndUpdate(image._id, image, { new: true });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}

// Delete image
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

// get image by Id
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await Image.findById(imageId).populate("author", "clerkId");
    if (!image) throw new Error("IMAGE NOT FOUND");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}

// get all images
export async function getAllImages({
  limit = 9,
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

    let expression = "folder=imaginify";

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
      .skip(skipAmount)
      .limit(limit);

    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalImages: Math.ceil(savedImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}

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
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
