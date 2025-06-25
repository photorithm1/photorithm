import { connectToDatabase } from "@/database/mongoose";
import { handleError } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";
import Image from "@/database/models/image.model";
import User from "@/database/models/user.model";
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from "next/cache";

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

export async function getImagesCached() {
  "use cache";
  cacheTag("home-images");
  cacheLife("hours");
  return getAllImages({ limit: 6 });
}
