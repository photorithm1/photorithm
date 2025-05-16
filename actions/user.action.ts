"use server";

import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import User from "@/database/models/user.model";
import { connectToDatabase } from "@/database/mongoose";
import { handleError } from "../lib/utils";
import mongoose from "mongoose";
import Image from "@/database/models/image.model";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

// READ
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

// UPDATE
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

// DELETE
export async function deleteUser(clerkId: string) {
  /*
  It is important to delete user along with their corresponding image documents
  For atomic operation on deletion of user and their corresponding image document, We used
  mongodb's transaction feature
  */
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

    // even if cloudinary deletion operation fails, /cloudinary/cleanup api will handel the cleanup
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

// USE CREDITS
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
