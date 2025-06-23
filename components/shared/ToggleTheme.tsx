"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ToggleTheme({ className }: { className?: string }) {
  const { setTheme, theme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={"flex items-center " + className}>
          {resolvedTheme === "light" ? (
            <Sun className="h-[24px] w-[24px] rotate-0 fill-accent-foreground scale-100 transition-all dark:-rotate-90 " />
          ) : (
            <Moon className="h-[24px] w-[24px] rotate-0 fill-accent-foreground scale-100 transition-all dark:-rotate-90 " />
          )}

          <span className="text-primary capitalize  font-semibold p-4">{theme}</span>
        </div>

        {/* <span className='text-primary'>Toggle theme</span> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
