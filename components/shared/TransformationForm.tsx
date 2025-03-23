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
import { AspectRatioKey, debounce, deepEqual, deepMergeObjects } from "@/lib/utils";
import { Button } from "../ui/button";
import { updateCredits } from "@/lib/actions/user.action";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "@/lib/actions/image.action";
import { useRouter } from "next/navigation";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";
import { useToast } from "../ui/use-toast";

export const formSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
  privacy: z.string(),
});

export default function TransformationForm({
  action,
  data = null,
  userId,
  type,
  creditBalance,
  config = null,
}: TransformationFormProps) {
  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [_, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const [selectFieldValue, setSelectFieldValue] = useState<AspectRatioKey | null>(null);

  const initialValues =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
          privacy: data?.isPrivate ? "private" : "public",
        }
      : defaultValues;
  const transformationType = transformationTypes[type];

  useEffect(() => {
    (window as any).setImage = setImage;
    if (image && (type === "restore" || type === "removeBackground")) {
      setNewTransformation(transformationType.config);
    }
  }, [image, transformationType.config, type]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // if image is not transformed or privacy field is not mutated
    setIsSubmitting(true);
    if (data || image) {
      const transformationURL = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig,
      });
      const imageData = {
        title: values.title,
        publicId: image?.publicId,
        transformationType: type,
        width: image?.width,
        height: image?.height,
        config: transformationConfig,
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
            form.reset();
            setImage(data);
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
              _id: data._id,
            },
            userId,
            path: `/transformations/${data._id}`,
          });
          if (updatedImage) {
            form.reset();
            setImage(data);
            router.push(`/transformations/${updatedImage._id}`);
          }
        } catch (error) {
          console.log("ERROR IN TRANSFORMATION FORM, UPDATE", error);
        }
      }
    }
  }
  (window as any).globalForm = form;

  function onSelectFieldHandler(value: string, onFiledChange: (value: string) => undefined) {
    // const imageSize = aspectRatioOptions[value as AspectRatioKey]
    // setImage((prevState: any) => ({
    //     ...prevState,
    //     aspectRatio: imageSize.aspectRatio,
    //     width: imageSize.width,
    //     height: imageSize.height
    // }))
    setSelectFieldValue(value as AspectRatioKey);
    setNewTransformation(transformationType.config);
    return onFiledChange(value);
  }

  function onSelectPrivacyFieldHandler(value: string, onFiledChange: (value: string) => undefined) {
    setImage(prevState => ({
      ...prevState,
      isPrivate: value === "private",
    }));
    return onFiledChange(value);
  }

  function onInputChangeHandler(
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) {
    setNewTransformation((prevState: any) => ({
      ...prevState,
      [type]: {
        ...prevState?.[type],
        [fieldName === "prompt" ? "prompt" : "to"]: value,
      },
    }));
    onChangeField(value);
  }

  async function onTransformHandler() {
    if (!newTransformation || deepEqual(newTransformation, transformationConfig)) {
      toast.toast({ description: "Please make some changes before applying transformations" });
      return;
    }

    if (type === "fill") {
      const imageSize = aspectRatioOptions[selectFieldValue!];
      setImage((prevState: any) => ({
        ...prevState,
        aspectRatio: imageSize.aspectRatio,
        width: imageSize.width,
        height: imageSize.height,
      }));
    }

    setIsTransforming(true);
    setTransformationConfig(deepMergeObjects(newTransformation, transformationConfig));
    setNewTransformation(null);
    startTransition(async () => {
      await updateCredits(userId, creditFee);

      toast.toast({
        title: "Transformed successfully",
        description: "1 credit deducted from your account. Please save the image",
        duration: 5000,
        className: "success-toast",
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
            <Select value={field.value} onValueChange={value => onSelectPrivacyFieldHandler(value, field.onChange)}>
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

        {(type === "remove" || type === "recolor") && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={type === "remove" ? "Object to remove" : "Object to recolor"}
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
            className="submit-button disabled:cursor-not-allowed capitalize"
          >
            {isTransforming ? "Transforming..." : "Apply transformation"}
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="submit-button disabled:cursor-not-allowed capitalize"
          >
            {isSubmitting ? "Submitting..." : "Save Image"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
