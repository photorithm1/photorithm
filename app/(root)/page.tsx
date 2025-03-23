import { Toaster } from "@/components/ui/sonner";
import { UserButton } from "@clerk/nextjs";
import React from "react";

export default function Home() {
  return (
    <div>
      <UserButton />
      <Toaster />
    </div>
  );
}
