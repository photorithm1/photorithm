import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { getAllImages } from "@/data/image.data";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { StartupApiImageErrorResponse, StartupApiImageResponse } from "../api/(private)/startup/image/route";

/**
 * Home Page Component
 * 
 * The main landing page of the application that showcases:
 * - A hero section with transformation type shortcuts
 * - A collection of transformed images
 * 
 * Features:
 * - Dynamic image collection with pagination
 * - Search functionality
 * - Quick access to transformation types
 * - Responsive grid layout
 * 
 * @param {SearchParamProps} props - Component props including search parameters

 */
export default async function Home({ searchParams }: SearchParamProps) {
  const searchParamsResult = await searchParams;
  const page = Number(searchParamsResult?.page) || 1;
  const searchQuery = (searchParamsResult?.query as string) || "";
  let images: StartupApiImageResponse["data"];

  if (page === 1 && searchQuery === "") {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/startup/image`, {
      next: { revalidate: 900 },
      method: "GET",
      headers: {
        "x-internal-secret": process.env.INTERNAL_API_SECRET!,
      },
    });

    if (response.status >= 400) {
      const errorResponse: StartupApiImageErrorResponse = await response.json();
      throw new Error(errorResponse.errorMessage);
    }
    images = ((await response.json()) as StartupApiImageResponse).data;
  } else {
    images = await getAllImages({ page, searchQuery });
  }

  return (
    <>
      <section className="home">
        <h1 className="home-heading">Unleash Your Creative Vision with Photorithm</h1>
        <ul className="flex-center w-full gap-10">
          {navLinks.slice(1, 7).map(link => (
            <Link href={link.route} key={link.route} className="flex-center flex-col gap-2">
              <li className="flex-center w-fit rounded-full bg-primary-foreground dark:bg-primary text-primary p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-secondary dark:text-secondary-foreground">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>
      <section className="sm:mt-12">
        <Collection hasSearch images={images && images.data} totalPages={images?.totalImages} page={page} />
      </section>
    </>
  );
}
