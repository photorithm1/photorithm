"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants";
import { CustomField } from "./CustomField";
import { Form } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, useTransition } from "react";
import { AspectRatioKey, deepEqual, deepMergeObjects } from "@/lib/utils";
import { Button } from "../ui/button";
import { updateCredits } from "@/actions/user.action";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "@/actions/image.action";
import { useRouter } from "next/navigation";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";
import { toast } from "sonner";

/**
 * Form schema for image transformation
 * Validates required and optional fields for the transformation form
 */
export const formSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
  privacy: z.string(),
});

/**
 * TransformationForm Component
 *
 * Core component for handling image transformations in the application.
 * Manages the entire transformation workflow from image upload to saving.
 *
 * Features:
 * - Image upload and preview
 * - Multiple transformation types (restore, removeBackground, fill, etc.)
 * - Real-time transformation preview
 * - Credit management and validation
 * - Form validation with Zod
 * - Privacy settings
 *
 * Transformation Types:
 * - restore: Restore image quality
 * - removeBackground: Remove image background
 * - fill: Adjust image aspect ratio
 * - remove: Remove objects from image
 * - recolor: Change object colors
 * - replaceBackground: Replace image background
 *
 * Credit System:
 * - Each transformation costs credits
 * - Credit balance is checked before transformation
 * - Credits are deducted after successful transformation
 *
 * @param {TransformationFormProps} props
 * @param {string} props.action - "Add" or "Update"
 * @param {TImage | null} props.data - Existing image data for updates
 * @param {string} props.userId - User's ID
 * @param {TransformationTypeKey} props.type - Type of transformation
 * @param {number} props.creditBalance - User's current credit balance
 * @param {Transformations | null} props.config - Initial transformation config
 */
export default function TransformationForm({
  action,
  data = null,
  userId,
  type,
  creditBalance,
  config = null,
}: TransformationFormProps) {
  const [image, setImage] = useState<TImage | null>(data);
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [selectFieldValue, setSelectFieldValue] = useState<AspectRatioKey | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const initialValues =
    image && action === "Update"
      ? {
          title: image.title,
          aspectRatio: image.aspectRatio,
          color: image.color,
          prompt: image.prompt,
          publicId: image.publicId,
          privacy: image.isPrivate ? "private" : "public",
        }
      : defaultValues;
  const transformationType = transformationTypes[type];

  useEffect(() => {
    if (image && (type === "restore" || type === "removeBackground")) {
      setNewTransformation(transformationType.config);
    }
  }, [image, transformationType.config, type]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  /**
   * Handles form submission for both new and updated transformations
   * Creates or updates the image in the database and redirects to the result
   *
   * @param {z.infer<typeof formSchema>} values - Form values
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!image) return;
    if (error) {
      toast.error("Error while submitting", {
        description: <div className="text-primary">{error.message}</div>,
        duration: 5000,
        closeButton: true,
      });
      return;
    }
    setIsSubmitting(true);
    const transformationURL = getCldImageUrl({
      width: image.width,
      height: image.height,
      src: image.publicId,
      ...transformationConfig,
    });
    const imageData = {
      title: values.title,
      publicId: image.publicId,
      transformationType: type,
      width: image.width,
      height: image.height,
      config: transformationConfig!,
      secureURL: image?.secureURL,
      transformationURL,
      aspectRatio: values.aspectRatio,
      prompt: values.prompt,
      color: values.color,
      isPrivate: values.privacy === "private",
    };

    if (action === "Add") {
      try {
        const newImage = await addImage({
          image: imageData,
          userId,
          path: "/",
        });
        if (newImage) {
          router.push(`/transformations/${newImage._id}`);
        }
      } catch (error) {
        console.log("ERROR IN TRANSFORMATION FORM, ADD", error);
      }
    }

    if (action === "Update") {
      try {
        const updatedImage = await updateImage({
          image: {
            ...imageData,
            _id: image._id!,
          },
          userId,
          path: `/transformations/${image._id}`,
        });
        if (updatedImage) {
          router.push(`/transformations/${updatedImage._id}`);
        }
      } catch (error) {
        console.log("ERROR IN TRANSFORMATION FORM, UPDATE", error);
      }
    }
  }

  /**
   * Handles aspect ratio selection for fill transformations
   * Updates the transformation config with new aspect ratio
   *
   * @param {string} value - Selected aspect ratio
   * @param {function} onFiledChange - Form field change handler
   */
  function onSelectFieldHandler(value: string, onFiledChange: (value: string) => undefined) {
    setSelectFieldValue(value as AspectRatioKey);
    setNewTransformation(transformationType.config);
    return onFiledChange(value);
  }

  /**
   * Handles input changes for transformation-specific fields
   * Updates the transformation config with new values
   *
   * @param {string} fieldName - Name of the field being changed
   * @param {string} value - New field value
   * @param {"remove" | "recolor" | "replaceBackground"} type - Type of transformation
   * @param {function} onChangeField - Form field change handler
   */
  function onInputChangeHandler(
    fieldName: string,
    value: string,
    type: "remove" | "recolor" | "replaceBackground",
    onChangeField: (value: string) => void
  ) {
    setNewTransformation(prevState => ({
      ...prevState,
      [type]: {
        ...prevState?.[type],
        [fieldName === "prompt" ? "prompt" : "to"]: value,
      },
    }));
    onChangeField(value);
  }

  /**
   * Applies the transformation to the image
   * Handles credit deduction and shows appropriate notifications
   */
  async function onTransformHandler() {
    if (image === null) return;

    if (
      (!newTransformation || deepEqual(newTransformation, transformationConfig)) &&
      form.getValues("aspectRatio") === initialValues.aspectRatio
    ) {
      toast.error("No changes made", {
        description: <div className="text-primary">Please make some changes before applying transformations</div>,
        duration: 5000,
      });
      return;
    }

    if (type === "fill") {
      const imageSize = aspectRatioOptions[selectFieldValue!];
      setImage(prevState =>
        prevState
          ? {
              ...prevState,
              aspectRatio: imageSize.aspectRatio,
              width: imageSize.width,
              height: imageSize.height,
            }
          : null
      );
    }

    setIsTransforming(true);
    setTransformationConfig(deepMergeObjects(newTransformation, transformationConfig));
    setNewTransformation(null);
    startTransition(async () => {
      await updateCredits(userId, creditFee);

      toast.success("Transformed successfully", {
        description: <div className="text-primary">1 credit deducted from your account. Please save the image</div>,
        duration: 5000,
      });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
        <CustomField
          control={form.control}
          name="title"
          formLabel="Image title"
          className="w-full"
          render={({ field }) => <Input className="input-field" {...field} />}
        />

        <CustomField
          control={form.control}
          name="privacy"
          formLabel="Privacy (Select whether your image is public or private)"
          className="w-full"
          render={({ field }) => (
            <Select value={field.value} onValueChange={value => field.onChange(value)}>
              <SelectTrigger className="select-field">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem className="select-item" value="public">
                  Public
                </SelectItem>
                <SelectItem className="select-item" value="private">
                  Private
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {type === "fill" && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select onValueChange={value => onSelectFieldHandler(value, field.onChange)} value={field.value}>
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map(option => (
                    <SelectItem key={option} className="select-item" value={option}>
                      {aspectRatioOptions[option as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(type === "remove" || type === "recolor" || type === "replaceBackground") && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={
                type === "remove"
                  ? "Object to remove"
                  : type === "recolor"
                    ? "Object to recolor"
                    : "Background to replace"
              }
              className="w-full"
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  onChange={e => onInputChangeHandler("prompt", e.target.value, type, field.onChange)}
                />
              )}
            />

            {type === "recolor" && (
              <CustomField
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input
                    type="color"
                    value={field.value}
                    className="input-field"
                    onChange={e => onInputChangeHandler("color", e.target.value, "recolor", field.onChange)}
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="media-uploader-field">
          <CustomField
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={field.value}
                image={image}
                type={type}
              />
            )}
          />
          <TransformedImage
            setError={setError}
            image={image}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            disabled={isTransforming || !image}
            onClick={onTransformHandler}
            className="submit-button disabled:cursor-not-allowed capitalize bg-primary"
          >
            {isTransforming ? "Transforming..." : "Apply transformation"}
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="submit-button disabled:cursor-not-allowed capitalize bg-primary"
          >
            {isSubmitting ? "Submitting..." : "Save Image"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
