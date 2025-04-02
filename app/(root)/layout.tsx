import MobileNav from "@/components/shared/MobileNav";
import SideBar from "@/components/shared/SideBar";
import { Toaster } from "@/components/ui/sonner";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="root">
      <SideBar />
      <MobileNav />

      <div className="root-container">
        <div className="wrapper">{children}</div>
      </div>
      <Toaster />
    </main>
  );
}
