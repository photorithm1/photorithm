/**
 * Credits Page Component
 *
 * This page displays available credit packages for users to purchase.
 * It shows different plans with their prices, credit amounts, and included features.
 *
 * Features:
 * - Displays credit packages from the plans constant
 * - Shows plan details including price, credits, and inclusions
 * - Integrates with Clerk for authentication
 * - Provides checkout functionality for paid plans
 * - Handles free plan display
 *
 * Authentication:
 * - Requires user to be signed in
 * - Redirects to sign-in page if not authenticated
 *
 * @returns {Promise<JSX.Element>} The rendered credits page
 */
import { SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { plans } from "@/constants";
import Checkout, { InvokeToastForPaymentStatus } from "@/components/shared/Checkout";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StartupApiUserErrorResponse, StartupApiUserResponse } from "@/app/api/(private)/startup/user/[id]/route";

const Credits = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/startup/user/${userId}`, {
    method: "GET",
    headers: {
      "x-internal-secret": process.env.INTERNAL_API_SECRET!,
    },
    next: { revalidate: 900, tags: [`user-${userId}`] },
  });

  if (response.status >= 400) {
    const errorResponse: StartupApiUserErrorResponse = await response.json();
    throw new Error(errorResponse.errorMessage);
  }
  const user: StartupApiUserResponse = await response.json();

  return (
    <>
      <InvokeToastForPaymentStatus />
      <Header title="Buy Credits" subtitle="Choose a credit package that suits your needs!" />

      <section>
        <ul className="credits-list">
          {plans.map(plan => (
            <li key={plan.name} className="credits-item">
              <div className="flex-center flex-col gap-3">
                <Image src={plan.icon} alt="check" width={50} height={50} />
                <p className="p-20-semibold mt-2 text-primary">{plan.name}</p>
                <p className="h1-semibold text-primary">₹{plan.price}</p>
                <p className="p-16-regular">{plan.credits} Credits</p>
              </div>

              {/* Inclusions */}
              <ul className="flex flex-col gap-5 py-9">
                {plan.inclusions.map(inclusion => (
                  <li key={plan.name + inclusion.label} className="flex items-center gap-4">
                    <Image
                      src={`/assets/icons/${inclusion.isIncluded ? "check.svg" : "cross.svg"}`}
                      alt="check"
                      className={inclusion.isIncluded ? "dark:filter dark:invert dark:brightness-200" : ""}
                      width={24}
                      height={24}
                    />
                    <p className="p-16-regular">{inclusion.label}</p>
                  </li>
                ))}
              </ul>

              {plan.name === "Free" ? (
                <Button variant="outline" className="credits-btn">
                  Free Consumable
                </Button>
              ) : (
                <SignedIn>
                  <Checkout plan={plan.name} amount={plan.price} credits={plan.credits} buyerId={user.data._id} />
                </SignedIn>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Credits;
