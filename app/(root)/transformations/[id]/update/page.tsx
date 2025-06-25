/**
 * Update Transformation Page Component
 *
 * Renders the transformation form for updating an existing image transformation.
 * Handles basic authorization and data fetching before passing control to the form.
 *
 * @param {SearchParamProps} params - Contains the transformation ID in the URL
 * @returns {Promise<JSX.Element>} The rendered update transformation page
 */
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getImageById } from "@/actions/image.action";
import { getUserByIdCached } from "@/data/user.data";

const Page = async ({ params }: SearchParamProps) => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserByIdCached(userId);
  const { id } = await params;
  const image = await getImageById(id);

  if (!image || typeof image.author === "string") notFound(); // author is populated in  getUserById, this is just to satisfy typescript

  if (image.author.clerkId !== userId) {
    notFound();
  }

  const transformation = transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user._id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  );
};

export default Page;
