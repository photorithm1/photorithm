import { Document, Model, Schema, model, models, Types } from "mongoose";

export interface IImage {
  _id: Types.ObjectId;
  title: string;
  transformationType: string;
  publicId: string;
  secureURL: string;
  width?: number; // Optional property
  height?: number; // Optional property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any; // Optional object property, type can't be determined from schema
  transformationUrl?: URL; // Optional property
  aspectRatio?: string; // Optional property
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
