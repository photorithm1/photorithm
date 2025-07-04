"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

/**
 * Search Component
 *
 * A search input component with debounced URL query updates.
 * Updates the URL search parameters as the user types.
 *
 * Key Features:
 * - Debounced search (300ms delay)
 * - URL query parameter management
 * - Dark mode support for search icon
 * - Real-time search updates
 *
 * Implementation Details:
 * - Uses URL search params for state management
 * - Cleans up query params when search is empty
 * - Prevents unnecessary page scrolls during search
 */
export const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        const newUrl = formUrlQuery({
          searchParams: searchParams.toString(),
          key: "query",
          value: query,
        });

        router.push(newUrl, { scroll: false });
      } else {
        const newUrl = removeKeysFromQuery({
          searchParams: searchParams.toString(),
          keysToRemove: ["query"],
        });

        router.push(newUrl, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [router, searchParams, query]);

  return (
    <div className="search">
      <Image
        src="/assets/icons/search.svg"
        className="dark:invert dark:filter dark:brightness-200"
        alt="search"
        width={28}
        height={24}
      />

      <input className="search-field" placeholder="Search" onChange={e => setQuery(e.target.value)} />
    </div>
  );
};
