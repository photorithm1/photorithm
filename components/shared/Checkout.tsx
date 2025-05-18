"use client";

import { useEffect } from "react";
import { checkoutCredits } from "@/actions/transaction.action";
import { toast } from "sonner";
import { Button } from "../ui/button";

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  const onCheckout = async () => {
    const transaction: CheckoutTransactionParams = {
      plan,
      amount,
      credits,
      buyerId,
      cancelURL: `${location.origin}/credits?success=false`,
      successURL: `${location.origin}/credits?success=true`,
    };

    await checkoutCredits(transaction);
  };

  return (
    <form action={onCheckout} method="POST">
      <section>
        <Button type="submit" role="link" className="w-full rounded-full bg-purple-gradient bg-cover">
          Buy Credit
        </Button>
      </section>
    </form>
  );
};

function InvokeToastForPaymentStatus() {
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success") === "true") {
      toast("Order placed!", {
        description: "You will receive an email confirmation",
        duration: 5000,
        className: "success-toast",
      });
    }

    if (query.get("success") === "false") {
      toast("Order canceled!", {
        description: "Continue to shop around and checkout when you're ready",
        duration: 5000,
        className: "error-toast",
      });
    }
  }, []);

  return null;
}

export { InvokeToastForPaymentStatus };
export default Checkout;
