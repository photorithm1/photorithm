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
        <Button type="submit" role="link" className="w-full rounded-full cursor-pointer  bg-cover">
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
