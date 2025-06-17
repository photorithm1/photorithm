/**
 * @route POST /api/webhooks/stripe
 *
 * Handles incoming webhook events from Stripe.
 *
 * This route listens for Stripe events such as:
 * - `checkout.session.completed`: Triggered after a successful checkout session.
 *
 * Actions Taken:
 * - Verifies the Stripe event using the signature header (`stripe-signature`) and the
 *   endpoint secret (`STRIPE_WEBHOOK_SECRET` from `.env.local`).
 * - For `checkout.session.completed`:
 *   - Extracts transaction details (amount, plan, credits, buyerId) from the session metadata.
 *   - Calls `createTransaction()` to:
 *     - Store the transaction in the local database.
 *     - Update the associated user's credit balance accordingly.
 *
 * Security:
 * - Only authentic events signed by Stripe are processed.
 * - Invalid or tampered events are rejected with an error response.
 *
 * Setup Instructions:
 * - Set the secret key in `.env.local` as `STRIPE_WEBHOOK_SECRET`.
 * - Configure this route URL as a webhook endpoint in the Stripe dashboard.
 *
 * Recommended Usage:
 * - This endpoint should only handle POST requests from Stripe's webhook system.
 * - Should not be exposed for direct client interaction.
 */
import { createTransaction } from "@/actions/transaction.action";
import { NextResponse } from "next/server";
import stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();

  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.log("STRIPE WEBHOOK ERROR", err);
    return NextResponse.json({ message: "Webhook error", error: err });
  }

  // Get the ID and type
  const eventType = event.type;

  // CREATE
  if (eventType === "checkout.session.completed") {
    const { id, amount_total, metadata } = event.data.object;

    const transaction = {
      stripeId: id,
      amount: amount_total ? amount_total / 100 : 0,
      plan: metadata?.plan || "",
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata?.buyerId || "",
      createdAt: new Date(),
    };

    const newTransaction = await createTransaction(transaction);

    return NextResponse.json({ message: "OK", transaction: newTransaction });
  }

  return new Response("", { status: 200 });
}
