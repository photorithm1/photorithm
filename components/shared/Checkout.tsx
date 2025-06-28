"use client";

import { useEffect } from "react";
import { checkoutCredits } from "@/actions/transaction.action";
import { toast } from "sonner";
import { Button } from "../ui/button";

/**
 * Props for the Checkout component
 * Used to handle credit purchase transactions
 */
type CheckoutProps = {
  /** The selected plan name */
  plan: string;
  /** The amount to be charged */
  amount: number;
  /** Number of credits to be purchased */
  credits: number;
  /** ID of the user making the purchase */
  buyerId: string;
  /** mongodb _id of user */
};

/**
 * Checkout Component
 *
 * A component that handles credit purchase transactions.
 * Integrates with a payment system to process credit purchases.
 *
 * Key Features:
 * - Credit purchase form
 * - Transaction handling
 * - Success/failure URL handling
 * - Payment status notifications
 *
 * Usage Context:
 * This component is used in the credits page to allow users
 * to purchase additional credits for image transformations.
 */
const Checkout = ({ plan, amount, credits, buyerId }: CheckoutProps) => {
  console.log(buyerId);
  const onCheckout = async () => {
    if (!buyerId) {
      toast.error("Error loading user", {
        closeButton: true,
        description: (
          <div className="text-primary">Please try again later, if issue persists then contact the developer</div>
        ),
        duration: 10000,
      });
      return;
    }
    const transaction: CheckoutTransactionParams = {
      buyerId,
      plan,
      amount,
      credits,
      cancelURL: `${location.origin}/credits?success=false`,
      successURL: `${location.origin}/credits?success=true`,
    };

    await checkoutCredits(transaction);
  };

  return (
    <form action={onCheckout} method="POST">
      <section>
        <Button type="submit" disabled={!buyerId} role="link" className="w-full rounded-full cursor-pointer  bg-cover">
          Buy Credit
        </Button>
      </section>
    </form>
  );
};

/**
 * InvokeToastForPaymentStatus Component
 *
 * A utility component that displays toast notifications
 * based on the payment transaction status.
 *
 * Key Features:
 * - Payment success notification
 * - Payment cancellation notification
 * - URL parameter handling
 *
 * Usage Context:
 * This component is used alongside the Checkout component
 * to provide feedback about payment transaction status.
 */
function InvokeToastForPaymentStatus() {
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success") === "true") {
      toast.success("You purchased some credits!", {
        description: <div className="text-primary">Cool, now you can transform image again!</div>,
        closeButton: true,
        duration: 5000,
      });
    }

    if (query.get("success") === "false") {
      toast.error("Purchase canceled!", {
        description: <div className="text-primary">Continue to shop around and checkout when you are ready</div>,
        closeButton: true,
        duration: 5000,
      });
    }
  }, []);

  return null;
}

export { InvokeToastForPaymentStatus };
export default Checkout;
