"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * InsufficientCreditsModal Component
 *
 * A modal dialog that appears when a user has insufficient credits
 * to perform an image transformation.
 *
 * Key Features:
 * - Alert dialog with custom styling
 * - Visual feedback with stacked coins image
 * - Navigation options to profile or credits page
 * - Responsive design
 *
 * Usage Context:
 * This component is displayed when a user attempts to perform
 * an image transformation without having enough credits.
 * It provides clear options to either cancel the operation
 * or proceed to purchase more credits.
 *
 * Implementation Details:
 * - Used in TransformationForm component
 * - Conditionally rendered when creditBalance < creditFee
 * - Provides navigation to profile or credits page
 * - Uses AlertDialog from shadcn/ui for consistent styling
 */
export const InsufficientCreditsModal = () => {
  const router = useRouter();

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex-between">
            <p className="p-16-semibold text-primary">Insufficient Credits</p>
            <AlertDialogCancel className="border-0 p-0 hover:bg-transparent" onClick={() => router.push("/profile")}>
              <Image
                src="/assets/icons/close.svg"
                alt="credit coins"
                width={24}
                height={24}
                className="cursor-pointer"
              />
            </AlertDialogCancel>
          </div>

          <Image src="/assets/images/stacked-coins.png" alt="credit coins" width={462} height={122} />

          <AlertDialogTitle className="p-24-bold text-primary">
            Oops.... Looks like you&#39;ve run out of free credits!
          </AlertDialogTitle>

          <AlertDialogDescription className="p-16-regular py-3">
            No worries, though - you can keep enjoying our services by grabbing more credits.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => router.push("/profile")}>No, Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-primary bg-cover" onClick={() => router.push("/credits")}>
            Yes, Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
