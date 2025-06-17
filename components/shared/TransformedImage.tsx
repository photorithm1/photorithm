"use client";

import { CldImage, getCldImageUrl } from "next-cloudinary";
import { dataUrl, download, getImageSize } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import { toast } from "sonner";

/**
 * Props for the TransformedImage component
 * Used to display and manage transformed images with Cloudinary integration
 */
type TransformedImageProps = {
  /** The image data to be transformed */
  image: TImage | null;
  /** Type of transformation being applied */
  type: string;
  /** Title of the image */
  title: string;
  /** Configuration for the transformation */
  transformationConfig: Transformations | null;
  /** Whether the image is currently being transformed */
  isTransforming: boolean;
  /** Function to update transformation state */
  setIsTransforming?: React.Dispatch<React.SetStateAction<boolean>>;
  /** Function to handle errors */
  setError?: React.Dispatch<React.SetStateAction<Error | null>>;
  /** Whether to show the download button */
  hasDownload?: boolean;
};

/**
 * TransformedImage Component
 * 
 * A specialized component for displaying transformed images with Cloudinary integration.
 * Handles image transformation display, loading states, error handling, and download functionality.
 * 
 * Key Features:
 * - Real-time transformation preview using Cloudinary
 * - Loading state indicator during transformation
 * - Error handling for failed transformations
 * - Image download functionality
 * - Responsive image sizing
 * 
 * Usage Context:
 * This component is used within the TransformationForm to display the transformed image
 * after applying various transformations like:
 * - Background removal
 * - Color adjustments
 * - Aspect ratio changes
 * - Object removal
 * 
 * @param {TransformedImageProps} props - Component props

 */
export default function TransformedImage({
  image,
  type,
  title,
  transformationConfig,
  isTransforming,
  setIsTransforming,
  setError,
  hasDownload = true,
}: TransformedImageProps) {
  /**
   * Handles image download
   * Generates the transformed image URL and triggers download
   *
   * @param {React.MouseEvent} event - Click event
   */
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

  /**
   * Handles image loading errors
   * Updates error state and shows error notification
   *
   * @param {React.SyntheticEvent<HTMLImageElement, Event>} event - Error event
   */
  async function handelImageLoadingError(event: React.SyntheticEvent<HTMLImageElement, Event>) {
    if (setIsTransforming) setIsTransforming(false);
    const errorResponse = await fetch((event.target as HTMLImageElement).src);
    const errorMessage = errorResponse.headers.get("x-cld-error");
    if (setError) setError(new Error(errorMessage!));
    if (!errorMessage) return;
    toast.error("Error occurred while loading image", {
      description: <div className="text-primary">{errorMessage}</div>,
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
            <Image
              src={"/assets/icons/download.svg"}
              alt="download"
              height={24}
              width={24}
              className="dark:filter dark:invert dark:brightness-200 pb-[6px]"
            />
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
              if (setIsTransforming) setIsTransforming(false);
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
