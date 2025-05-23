import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/shared/Header";
import TransformedImage from "@/components/shared/TransformedImage";
import { Button } from "@/components/ui/button";
import { getImageById } from "@/actions/image.action";
import { getImageSize } from "@/lib/utils";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { notFound } from "next/navigation";

const ImageDetails = async ({ params }: SearchParamProps) => {
  const { userId } = await auth();
  const { id } = await params;
  let image;
  try {
    image = await getImageById(id);
    if (!image) notFound();
    if (typeof image.author === "string") notFound(); // image.author should be of type TUser since getImageById populates author field (This code was to satisfy ts)

    if (image.isPrivate && image.author.clerkId !== userId) notFound();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    notFound();
  }
  // console.log(image)
  // console.log(userId, image.author.clerkId)
  return (
    <>
      <Header title={image.title} />

      <section className="mt-5 flex flex-wrap gap-4">
        <div className="p-14-medium md:p-16-medium flex gap-2">
          <p className="text-primary">Transformation:</p>
          <p className=" capitalize text-primary">{image.transformationType}</p>
        </div>

        {image.prompt && (
          <>
            <p className="hidden text-primary md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2 ">
              <p className="text-primary">Prompt:</p>
              <p className=" capitalize text-secondary-foreground">{image.prompt}</p>
            </div>
          </>
        )}

        {image.color && (
          <>
            <p className="hidden text-primary md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-primary">Color:</p>
              <p className=" capitalize text-secondary-foreground">{image.color}</p>
            </div>
          </>
        )}

        {image.aspectRatio && (
          <>
            <p className="hidden text-primary md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-primary">Aspect Ratio:</p>
              <p className=" capitalize text-secondary-foreground">{image.aspectRatio}</p>
            </div>
          </>
        )}
      </section>

      <section className="mt-10 border-t border-dark-400/15">
        <div className="transformation-grid">
          {/* MEDIA UPLOADER */}
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-primary">Original</h3>

            <Image
              width={getImageSize(image.transformationType, image, "width")}
              height={getImageSize(image.transformationType, image, "height")}
              src={image.secureURL}
              alt="image"
              className="transformation-original_image"
            />
          </div>

          {/* TRANSFORMED IMAGE */}
          <TransformedImage
            image={image}
            type={image.transformationType}
            title={image.title}
            isTransforming={false}
            transformationConfig={image.config}
            hasDownload={true}
          />
        </div>

        {userId === image.author.clerkId && (
          <div className="mt-4 space-y-4">
            <Button asChild type="button" className="submit-button capitalize">
              <Link href={`/transformations/${image._id}/update`}>Update Image</Link>
            </Button>

            <DeleteConfirmation imageId={image._id!} />
          </div>
        )}
      </section>
    </>
  );
};

export default ImageDetails;
