"use client";

import { CldImage, getCldImageUrl } from "next-cloudinary";
import { dataUrl, download, getImageSize } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import { toast } from "sonner";

// This component will only use publicId, height and width props of "image" and only work when transformationConfig props is not null
export default function TransformedImage({
  image,
  type,
  title,
  transformationConfig,
  isTransforming,
  setIsTransforming,
  hasDownload = true,
}: TransformedImageProps) {
  // console.log({ image, type, title, transformationConfig, isTransforming, setIsTransforming, hasDownload  })

  function downloadHandler(event: React.MouseEvent) {
    event.preventDefault();
    if (!image) return;
    download(
      getCldImageUrl({
        width: image.width,
        height: image.height,
        src: image.publicId,
        ...transformationConfig,
      }),
      title
    );
  }

  async function handelImageLoadingError(event: React.SyntheticEvent<HTMLImageElement, Event>) {
    if (setIsTransforming) setIsTransforming(false); // if setIsTransforming function is defined or passed as prop
    const errorResponse = await fetch((event.target as HTMLImageElement).src);
    const errorMessage = errorResponse.headers.get("x-cld-error");
    if (!errorMessage) return;
    toast("Error occurred while loading image", {
      className: "error-toast",
      description: errorMessage,
      duration: 5000,
    });
  }

  const recolor = {
    ...transformationConfig?.recolor,
    to: transformationConfig?.recolor?.to.replace("#", ""),
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex-between">
        <h3 className="h3-bold text-primary">Transformed</h3>
        {hasDownload && (
          <button className="download-btn" onClick={downloadHandler}>
            <Image src={"/assets/icons/download.svg"} alt="download" height={24} width={24} className="pb-[6px]" />
          </button>
        )}
      </div>

      {image?.publicId && transformationConfig ? (
        <div className="relative">
          <CldImage
            width={getImageSize(type, image, "width")}
            height={getImageSize(type, image, "height")}
            src={image?.publicId}
            alt={image.title}
            sizes={"(max-width:767px) 100vh, 50vh"}
            placeholder={dataUrl as PlaceholderValue}
            className="transformed-image"
            onLoad={() => {
              if (setIsTransforming) setIsTransforming(false); // if setIsTransforming function is defined or passed as prop
            }}
            onError={e => handelImageLoadingError(e)}
            {...transformationConfig}
            recolor={recolor}
          />

          {isTransforming && (
            <div className="transforming-loader">
              <Image src="/assets/icons/spinner.svg" width={50} height={50} alt="transforming" />
            </div>
          )}
        </div>
      ) : (
        <div className="transformed-placeholder">Transformed Image</div>
      )}
    </div>
  );
}
