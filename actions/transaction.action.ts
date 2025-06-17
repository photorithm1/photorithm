"use server";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { handleError } from "../lib/utils";
import { connectToDatabase } from "../database/mongoose";
import Transaction from "../database/models/transaction.model";
import { updateCredits } from "./user.action";

/**
 * Initiates a Stripe Checkout session for purchasing credits.
 *
 * This function:
 * - Converts the transaction amount to the smallest currency unit (paise for INR).
 * - Creates a Stripe Checkout session with metadata (plan, credits, buyerId).
 * - Redirects the user to the Stripe-hosted payment page.
 *
 * @param transaction - Object containing checkout data like amount, plan, buyerId, etc.
 */
export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const amount = Number(transaction.amount) * 100; // convert rupees to paisa, stripe accepts smallest unit of currency

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "inr",
          unit_amount: amount,
          product_data: {
            name: transaction.plan,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      plan: transaction.plan,
      credits: transaction.credits,
      buyerId: transaction.buyerId,
    },
    mode: "payment",
    success_url: transaction.successURL,
    cancel_url: transaction.cancelURL,
  });

  redirect(session.url!);
}

/**
 * Records a successful transaction and updates the user's credit balance.
 *
 * This function is typically called from the Stripe webhook handler after a successful payment.
 * It:
 * - Connects to the database
 * - Creates a new transaction document in the `transactions` collection
 * - Calls `updateCredits()` to increase the user's available credits
 *
 * @param transaction - Object containing transaction details like amount, buyerId, credits, etc.
 * @returns The newly created transaction document
 */
export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // create a transaction with buyerId
    const newTransaction = await Transaction.create({
      ...transaction,
      buyer: transaction.buyerId,
    });
    await updateCredits(transaction.buyerId, transaction.credits);
    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
}
