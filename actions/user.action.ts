"use server";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import User from "@/database/models/user.model";
import { connectToDatabase } from "@/database/mongoose";
import { handleError } from "../lib/utils";
import mongoose from "mongoose";
import Image from "@/database/models/image.model";

/**
 * Creates a new user document in the database.
 *
 * This is typically used in Clerk's webhook handler when a new user signs up.
 *
 * @param user - The user data to be stored.
 * @returns The created user object or undefined on error.
 */
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Retrieves a user from the database using their Clerk ID.
 *
 * @param userId - The Clerk ID of the user.
 * @returns The user object if found, or undefined on error.
 */
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Updates a user document in the database using their Clerk ID.
 *
 * Typically triggered by a Clerk webhook update.
 *
 * @param clerkId - The Clerk ID of the user.
 * @param user - The fields to update in the user document.
 * @returns The updated user object or undefined on error.
 */
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Deletes a user and all their associated image documents.
 *
 * Uses a MongoDB transaction to ensure atomic deletion.
 * Attempts to delete Cloudinary assets, but defers any failures to the `api/cloudinary/cleanup` route.
 *
 * @param clerkId - The Clerk ID of the user to delete.
 * @returns The deleted user object or undefined on error.
 */
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const session = await mongoose.startSession();
    session.startTransaction();
    const deletedUser = await User.findOneAndDelete({ clerkId }).session(session);
    if (!deletedUser) {
      session.abortTransaction();
      session.endSession();
      throw new Error("User not found");
    }
    const publicIdsOfImagesToRemove = (await Image.find({ author: deletedUser._id }).session(session)).map(
      images => images.publicId
    );

    await Image.deleteMany({ author: deletedUser._id }).session(session);
    session.commitTransaction();
    session.endSession();

    // even if cloudinary deletion operation fails, api/cloudinary/cleanup route will handel the cleanup
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    // invoke delete_resources method if images present
    if (publicIdsOfImagesToRemove.length > 0) {
      cloudinary.api.delete_resources(publicIdsOfImagesToRemove).catch(error => {
        console.log("COULD NOT DELETE USER ASSETS FROM CLOUDINARY", error);
      });
    }

    // Delete user
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Updates a user's credit balance by incrementing it.
 *
 * The `creditFee` should be a **negative**
 * number to reduce credits and a **positive** number to add credits.
 *
 * Examples:
 * - `updateCredits("user123", -5)` → deducts 5 credits
 * - `updateCredits("user123", 10)`  → adds 10 credits
 *
 * @param userId - The MongoDB `_id` of the user
 * @param creditFee - The amount to increment (positive or negative)
 * @returns The updated user object or `undefined` if failed
 */
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );

    if (!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}
