"use client";
import { Button } from "@/components/ui/button";
import React from "react";

export default function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="h-[80vh] flex-col flex justify-center items-center">
      <h3>{error.message || "Something went wrong, try reloading the page"}</h3>
      <Button variant="destructive" className="bg-red-500 text-secondary" onClick={() => location.reload()}>
        Reload
      </Button>
    </div>
  );
}
