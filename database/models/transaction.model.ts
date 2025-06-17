/**
 * Mongoose model for tracking credit purchase transactions in the application.
 *
 * This model represents a credit purchase transaction, storing details about
 * the purchase made through Stripe. Each transaction is linked to a user (buyer)
 * and records the amount paid, credits purchased, and the specific plan chosen.
 *
 * Used in:
 * - Credit purchase workflow (Checkout component)
 * - Stripe webhook handling for successful payments
 * - User credit balance updates
 */

import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface ITransaction {
  _id: Types.ObjectId | string;
  createdAt: Date;
  stripeId: string;
  amount: number;
  plan: string;
  credits: string;
  buyer: Types.ObjectId; // Reference to the user who bought, similar to foreign key
}

const TransactionSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stripeId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  plan: {
    type: String,
  },
  credits: {
    type: Number,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export type TransactionModel = Model<ITransaction & Document>;

const Transaction = (models?.Transaction || model("Transaction", TransactionSchema)) as TransactionModel;

export default Transaction;
