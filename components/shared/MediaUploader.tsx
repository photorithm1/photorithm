"use client";

import React from "react";
import { CldImage, CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
// import Image from "next/image";
import { dataUrl, getImageSize } from "@/lib/utils";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

/**
 * Props for the MediaUploader component
 * Used within TransformationForm to handle image uploads for transformations
 */
type MediaUploaderProps = {
  /** Function to handle value changes */
  onValueChange: (value: string) => void;
  /** Function to update image state */
  setImage: React.Dispatch<React.SetStateAction<TImage | null>>;
  /** Optional public ID of the image */
  publicId?: string;
  /** Current image data */
  image: TImage | null;
  /** Type of transformation */
  type: string;
};

/**
 * MediaUploader Component
 * 
 * A specialized component for handling image uploads in the transformation workflow.
 * Integrates with Cloudinary's upload widget to provide a seamless image upload experience.
 * 
 * Key Features:
 * - Cloudinary Upload Widget Integration
 * - Image Preview with Loading States
 * - Success/Error Notifications
 * - Automatic Image Data Management
 * 
 * Usage Context:
 * This component is specifically designed to work within the TransformationForm,
 * where it handles the initial image upload before any transformations are applied.
 * It's part of a larger workflow where:
 * 1. User uploads an image through this component
 * 2. Image data is stored in parent state
 * 3. User applies transformations
 * 4. Transformed image is saved
 * 
 * @param {MediaUploaderProps} props - Component props

 */
export default function MediaUploader({ onValueChange, setImage, image, type, publicId }: MediaUploaderProps) {
  /**
   * Handles successful image upload from Cloudinary
   * Updates both the form state and parent component state
   */
  const onUploadSuccessHandler = (result: CloudinaryUploadWidgetResults) => {
    if (typeof result.info === "string" || typeof result.info === "undefined") {
      toast.error("Upload may possibly failed", {
        description: <div className="text-primary">{result.info || "Undefined error occurred"}</div>,
        duration: 5000,
      });
      return;
    }
    const info = result.info;

    setImage({
      publicId: info?.public_id,
      width: info?.width,
      height: info?.height,
      secureURL: info.secure_url,
      title: "",
      transformationURL: "",
      transformationType: type,
      config: null,
      color: undefined,
      aspectRatio: undefined,
      isPrivate: false,
      prompt: undefined,
      author: "",
    });
    // console.log(result)

    onValueChange(info?.public_id);
    toast.success("Image uploaded successfully", {
      description: <div className="text-primary">Image was uploaded, please apply the transformation</div>,
      duration: 5000,
    });
  };

  /**
   * Handles upload errors from Cloudinary
   * Shows error notification to user
   */
  const onUploadErrorHandler = () => {
    toast.error("Something went wrong while uploading", {
      description: <div className="text-primary"> please try again</div>,
      duration: 5000,
    });
  };

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_PRESET}
      options={{ multiple: false, resourceType: "image" }}
      onSuccess={onUploadSuccessHandler}
      onError={onUploadErrorHandler}
    >
      {({ open }) => (
        <div className="flex flex-col gap-4">
          <h3 className="h3-bold text-primary">Original</h3>

          {publicId ? (
            <div className="cursor-pointer overflow-hidden rounded-[10px]">
              <CldImage
                width={getImageSize(type, image!, "width")}
                height={getImageSize(type, image!, "height")}
                src={publicId}
                alt="image"
                sizes={"(max-width:767px) 100vh, 50vh"}
                placeholder={dataUrl as PlaceholderValue}
                className="media-uploader_cldImage"
              />
            </div>
          ) : (
            <div className="media-uploader_cta" onClick={() => open()}>
              <div className="media-uploader_cta-image">
                {/* <Image src={"/assets/icons/add.svg"} alt="Add image" width={24} height={24} /> */}
                <PlusIcon className="rounded-2xl" />
              </div>
              <p className="p-14-medium">Click here to upload image</p>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
}
