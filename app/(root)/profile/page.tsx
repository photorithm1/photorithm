import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Collection } from "@/components/shared/Collection";
import Header from "@/components/shared/Header";
import { getUserImages, getUserImagesCount } from "@/actions/image.action";
// import { getUserById } from "@/actions/user.action";
import { getUserByIdCached } from "@/data/user.data";

/**
 * Profile Page Component
 *
 * Displays user profile information and their transformed images:
 * - Credit balance
 * - Number of transformations performed
 * - Paginated collection of user's images
 *
 * Features:
 * - Authentication check
 * - Credit balance display
 * - Transformation statistics
 * - User's image collection
 *
 * @param {SearchParamProps} searchParams - Contains pagination parameters
 */
const Profile = async ({ searchParams }: SearchParamProps) => {
  const page = Number((await searchParams)?.page) || 1;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserByIdCached(userId);
  const images = await getUserImages({ page, userId: user._id });

  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image src="/assets/icons/coins.svg" alt="coins" width={50} height={50} className="size-9 md:size-12" />
            <h2 className="h2-bold text-primary">{user.creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="p-14-medium md:p-16-medium">IMAGE MANIPULATION DONE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image src="/assets/icons/photo.svg" alt="coins" width={50} height={50} className="size-9 md:size-12" />
            <h2 className="h2-bold text-primary">{await getUserImagesCount(user._id)}</h2>
          </div>
        </div>
      </section>

      <section className="mt-8 md:mt-14">
        <Collection images={images && images.data} totalPages={images?.totalPages} page={page} />
      </section>
    </>
  );
};

export default Profile;
