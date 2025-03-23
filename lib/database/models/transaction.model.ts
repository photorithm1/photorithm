import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface ITransaction {
  _id: Types.ObjectId;
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
