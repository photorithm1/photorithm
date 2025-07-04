/**
 * Loading Component
 *
 * A full-screen loading overlay that displays a spinning animation.
 * Used as a loading state for the application while data is being fetched
 * or operations are being performed.
 *
 * Features:
 * - Full-screen overlay with semi-transparent background
 * - Centered spinning animation
 * - Responsive design
 *
 * @returns {JSX.Element} The rendered loading overlay
 */
"use client";
import Image from "next/image";
import React from "react";

export default function loading() {
  return (
    <div className="w-[100%] h-screen overflow-x-hidden flex justify-center items-center bg-[rgba(0,0,0,0.3)]">
      <Image src={"/assets/icons/spinner.svg"} width={50} height={50} alt="loading..." />
    </div>
  );
}
