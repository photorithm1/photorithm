"use client";
import { navLinks } from "@/constants";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import ToggleTheme from "./ToggleTheme";

export default function SideBar() {
  // console.log("hey..rendering...?".toUpperCase())
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const { user } = useUser();

  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        <Link href={"/"} className={"sidebar-logo dark:filter dark:invert dark:brightness-200"}>
          <Image src={"/assets/images/logo-text.svg"} alt="logo" width={180} height={28} />
        </Link>

        <nav className="sidebar-nav">
          <SignedIn>
            <ul className="sidebar-nav_elements">
              {navLinks.map(link => {
                const isActive = link.route === pathname;

                return (
                  <li
                    key={link.route}
                    className={`sidebar-nav_element group ${isActive ? "bg-primary  text-primary-foreground" : "text-primary"}`}
                  >
                    <Link className="sidebar-link" href={link.route}>
                      <Image
                        src={link.icon}
                        alt="icon"
                        width={24}
                        height={24}
                        className={
                          (resolvedTheme === "light" && isActive) || (resolvedTheme === "dark" && !isActive)
                            ? "filter invert brightness-200"
                            : ""
                        }
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}

              <li className="cursor-pointer  w-full">
                <ToggleTheme className="w-full pl-4 rounded-full  hover:outline-primary hover:outline-2 hover:shadow-inner" />
              </li>
              <li className="flex-center cursor-pointer gap-2 p-4">
                <UserButton />
                <span className="text-primary">
                  {user?.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user?.username}
                </span>
              </li>
            </ul>
          </SignedIn>

          <SignedOut>
            <Button asChild className="button bg-primary bg-cover">
              <Link href={"/sign-in"}>Login</Link>
            </Button>
          </SignedOut>
        </nav>
      </div>
    </aside>
  );
}
