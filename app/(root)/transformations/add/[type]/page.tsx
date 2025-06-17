import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import React from "react";

/**
 * Add Transformation Type Page
 *
 * A dynamic page that renders the transformation form based on the selected type.
 * Handles different transformation types like restore, remove background, etc.
 *
 * Features:
 * - Dynamic route based on transformation type
 * - Authentication check
 * - User credit balance integration
 * - Type-specific transformation form
 *
 * Form Props Logic:
 * - action="Add": Indicates this is a new transformation
 * - data=null: No existing image data since this is a new transformation
 * - type: Determines which transformation form to render
 * - creditBalance: User's available credits for transformations
 *
 * Authentication:
 * - Requires user to be signed in
 * - Redirects to sign-in page if not authenticated
 *
 * @param {SearchParamProps} props - Component props including transformation type
 */
export default async function AddTransformationTypePage({ params }: SearchParamProps) {
  const { userId } = await auth();
  const { type } = await params;
  if (!(type in transformationTypes)) notFound();

  const transformations = transformationTypes[type];

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  return (
    <>
      <Header title={transformations.title} subtitle={transformations.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          data={null}
          type={transformations.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
}
