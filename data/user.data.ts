import { connectToDatabase } from "@/database/mongoose";
import { handleError } from "@/lib/utils";
import User from "@/database/models/user.model";
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from "next/cache";

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

export async function getUserByIdCached(userId: string) {
  "use cache";
  cacheTag(`user-${userId}`);
  cacheLife("hours");
  return getUserById(userId);
}
