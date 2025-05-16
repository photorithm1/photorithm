import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { getAllImages } from "@/actions/image.action";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function Home({ searchParams }: SearchParamProps) {
  const searchParamsResult = await searchParams;
  const page = Number(searchParamsResult?.page) || 1;
  const searchQuery = (searchParamsResult?.query as string) || "";
  const images = await getAllImages({ page, searchQuery });

  return (
    <>
      <section className="home">
        <h1 className="home-heading">Unleash Your Creative Vision with Photorithm</h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 6).map(link => (
            <Link href={link.route} key={link.route} className="flex-center flex-col gap-2">
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
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
