import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/shared/Header";
import TransformedImage from "@/components/shared/TransformedImage";
import { Button } from "@/components/ui/button";
import { getImageById } from "@/data/image.data";
import { dataUrl, getImageSize } from "@/lib/utils";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { notFound } from "next/navigation";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

/**
 * Image Details Page Component
 *
 * Displays detailed information about a transformed image, including:
 * - Original and transformed image comparison
 * - Transformation metadata (type, prompt, color, aspect ratio)
 * - Owner-specific actions (update, delete)
 *
 * Features:
 * - Image privacy check
 * - Owner authorization
 * - Responsive image display
 * - Download functionality
 *
 * @param {SearchParamProps} params - Contains the image ID in the URL
 */
const ImageDetails = async ({ params }: SearchParamProps) => {
  const { userId } = await auth();
  const { id } = await params;
  let image;
  try {
    image = await getImageById(id);
    if (!image) notFound();

    // image.author should be of type TUser since getImageById populates author field (This code was to satisfy ts)
    if (typeof image.author === "string") notFound();

    if (image.isPrivate && image.author.clerkId !== userId) notFound();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    notFound();
  }

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

      <section className="mt-10 border-t border-primary">
        <div className="transformation-grid">
          {/* MEDIA UPLOADER */}
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-primary">Original</h3>

            <Image
              width={getImageSize(image.transformationType, image, "width")}
              height={getImageSize(image.transformationType, image, "height")}
              src={image.secureURL}
              placeholder={dataUrl as PlaceholderValue}
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
            <Button asChild type="button" className="button h-[44px] w-full md:h-[54px]">
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
