/**
 * Mongoose model for managing user accounts in the application.
 *
 * This model represents a user account, storing essential user information and
 * credit balance. It integrates with Clerk for authentication and maintains
 * synchronization through webhook events. Each user starts with 10 credits by
 * default and can purchase more through the credit system.
 *
 * Used in:
 * - User authentication and profile management (Clerk webhooks)
 * - Credit balance tracking and updates
 * - Image transformation workflow (credit deduction)
 * - User profile and collection pages
 */

import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface IUser {
  _id: Types.ObjectId | string;
  clerkId: string;
  email: string;
  username: string;
  photo: string;
  firstName?: string;
  lastName?: string;
  planId: number;
  creditBalance: number;
}

// Define the model interface with constructor
export type UserModel = Model<IUser & Document>;

const UserSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  planId: {
    type: Number,
    default: 1,
  },
  creditBalance: {
    type: Number,
    default: 10,
  },
});

// Use the custom UserModel type instead of Model<UserDocument>
const User = (models?.User || model("User", UserSchema)) as UserModel;
export default User;
