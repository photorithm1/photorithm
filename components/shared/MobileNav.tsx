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
import { useTheme } from "next-themes";
import ToggleTheme from "./ToggleTheme";

export default function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { resolvedTheme } = useTheme();
  // Check screen size on mount + resize
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 1024);
    checkScreen();

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!isMobile) return null; // Only render on mobile screens

  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-primary-foreground to-primary shadow-lg z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/images/logo-text.svg"
            className="dark:filter dark:invert dark:brightness-200"
            alt="logo"
            width={180}
            height={28}
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 relative">
          <ToggleTheme className="cursor-pointer" />
          <SignedIn>
            <div className="relative">
              <UserButton />
            </div>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
                  aria-label="Toggle menu"
                  aria-expanded={menuOpen ? "true" : "false"}
                >
                  {[...Array(4)].map((_, i) => (
                    <span
                      key={i}
                      className="block h-1 w-8 bg-primary-foreground rounded transition-all duration-300 ease-in-out"
                    />
                  ))}
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72 sm:w-80 bg-primary-foreground p-6 overflow-y-auto">
                <DialogTitle className="sr-only">Navigation Menu</DialogTitle>

                <Image
                  src="/assets/images/logo-text.svg"
                  alt="logo"
                  width={152}
                  height={23}
                  className="mb-4 dark:filter dark:invert dark:brightness-200"
                  loading="lazy"
                />

                <ul className="flex flex-col gap-4">
                  {navLinks.map(link => {
                    const isActive = link.route === pathname;
                    return (
                      <li
                        key={link.route}
                        className={`flex items-center gap-3 ${
                          isActive ? "text-primary-foreground bg-primary font-semibold rounded py-1.5" : "text-primary"
                        }`}
                      >
                        <SheetClose asChild>
                          <Link href={link.route} className="flex items-center gap-3">
                            <Image
                              src={link.icon}
                              className={
                                (resolvedTheme === "light" && isActive) || (resolvedTheme === "dark" && !isActive)
                                  ? "filter invert brightness-200"
                                  : ""
                              }
                              alt={link.label}
                              width={24}
                              height={24}
                            />
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
            <Button
              asChild
              variant={"ghost"}
              className="bg-primary-foreground text-primary px-4 py-2 rounded-lg font-semibold"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
