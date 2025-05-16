import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.action";
import { getImageById } from "@/lib/actions/image.action";

const Page = async ({ params }: SearchParamProps) => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
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
