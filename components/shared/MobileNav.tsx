"use client";

import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { DialogTitle } from "@radix-ui/react-dialog";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { navLinks } from "@/constants";

export default function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount + resize
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!isMobile) return null; // Only render on mobile screens

  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/images/logo-text.svg" alt="logo" width={180} height={28} priority />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 relative">
          <SignedIn>
            <div className="relative">
              <UserButton afterSignOutUrl="/" />
            </div>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
                  aria-label="Toggle menu"
                  aria-expanded={menuOpen ? "true" : "false"}
                >
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="block h-1 w-8 bg-white rounded transition-all duration-300 ease-in-out" />
                  ))}
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72 sm:w-80 bg-white p-6 overflow-y-auto">
                <DialogTitle className="sr-only">Navigation Menu</DialogTitle>

                <Image
                  src="/assets/images/logo-text.svg"
                  alt="logo"
                  width={152}
                  height={23}
                  className="mb-4"
                  loading="lazy"
                />

                <ul className="flex flex-col gap-4">
                  {navLinks.map(link => {
                    const isActive = pathname.startsWith(link.route);
                    return (
                      <li
                        key={link.route}
                        className={`flex items-center gap-3 ${
                          isActive ? "text-purple-600 font-semibold" : "text-gray-700"
                        }`}
                      >
                        <SheetClose asChild>
                          <Link href={link.route} className="flex items-center gap-3">
                            <Image src={link.icon} alt={link.label} width={24} height={24} />
                            {link.label}
                          </Link>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </SheetContent>
            </Sheet>
          </SignedIn>

          <SignedOut>
            <Button asChild className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
