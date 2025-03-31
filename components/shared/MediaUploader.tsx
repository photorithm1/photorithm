"use client";

import React from "react";
import { CldImage, CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import { dataUrl, getImageSize } from "@/lib/utils";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import { toast } from "sonner";

type MediaUploaderProps = {
  onValueChange: (value: string) => void;
  setImage: React.Dispatch<React.SetStateAction<TImage | null>>; // Fix this soon
  publicId?: string;
  image: TImage | null;
  type: string;
};

export default function MediaUploader({ onValueChange, setImage, image, type, publicId }: MediaUploaderProps) {
  const onUploadSuccessHandler = (result: CloudinaryUploadWidgetResults) => {
    if (typeof result.info === "string" || typeof result.info === "undefined") {
      toast("Upload may possibly failed, read the description below", {
        className: "error-toast",
        description: result.info || "Undefined error occurred",
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
      config: undefined,
      color: undefined,
      aspectRatio: undefined,
      isPrivate: false,
      prompt: undefined,
    });
    // console.log(result)

    onValueChange(info?.public_id);
    toast("Image uploaded successfully", {
      description: "Image was uploaded, please apply the transformation",
      duration: 5000,
      className: "success-toast",
    });
  };

  const onUploadErrorHandler = () => {
    toast("Something went wrong while uploading", {
      description: "please try again",
      duration: 5000,
      className: "error-toast",
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
          <h3 className="h3-bold text-dark-600">Original</h3>

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
                <Image src={"/assets/icons/add.svg"} alt="Add image" width={24} height={24} />
              </div>
              <p className="p-14-medium">Click here to upload image</p>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
}
