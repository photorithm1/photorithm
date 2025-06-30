/**
 * Mongoose model for managing image transformations and metadata in the application.
 *
 * This model represents a transformed image in the database, storing the original image's
 * metadata (publicId, secureURL) and transformation configurations. The transformed image
 * is not stored but generated on-the-fly using Cloudinary's transformation capabilities
 * when requested through components like CldImage. Each image is linked to a user (author).
 *
 * This model handles the storage and retrieval of transformed images, integrating with Cloudinary
 * for image processing and storage. It supports various transformation types including:
 * - Background removal
 * - Object removal
 * - Color recoloring
 * - Background replacement
 * - Image restoration
 * - Aspect ratio adjustments
 *
 * Used in:
 * - Image transformation workflow (TransformationForm)
 * - User's image collection
 * - Transformation details and preview
 */

import { AspectRatioKey } from "@/lib/utils";
import { Document, Model, Schema, model, models, Types } from "mongoose";

export interface IImage {
  _id: Types.ObjectId | string;
  title: string;
  transformationType: string;
  publicId: string;
  secureURL: string;
  width?: number; // Optional property
  height?: number; // Optional property
  config?: Transformations; // Optional object property, type can't be determined from schema
  transformationUrl?: URL; // Optional property
  aspectRatio?: AspectRatioKey; // Optional property
  color?: string; // Optional property
  prompt?: string; // Optional property
  author?: Types.ObjectId; // Reference to user, similar to foreign key
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema({
  title: { type: String, required: true },
  transformationType: { type: String, required: true },
  publicId: { type: String, required: true },
  secureURL: { type: String, required: true },
  width: { type: Number },
  height: { type: Number },
  config: { type: Object },
  transformationUrl: { type: String },
  aspectRatio: { type: String },
  color: { type: String },
  prompt: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isPrivate: { type: Boolean, default: false },
});

export type ImageModel = Model<IImage & Document>;

const Image = (models.Image || model("Image", ImageSchema)) as ImageModel;
export default Image;
