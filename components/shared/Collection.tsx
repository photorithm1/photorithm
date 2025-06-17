"use client";
// line 54
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";

import { Pagination, PaginationContent, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { transformationTypes } from "@/constants";
// import { IImage } from "@/lib/database/models/image.model";
import { dataUrl, formUrlQuery } from "@/lib/utils";

import { Button } from "../ui/button";

import { Search } from "././Search";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

/**
 * Props for the Collection component
 * Used to display a paginated list of transformed images
 */
type CollectionProps = {
  /** Array of transformed images to display */
  images: TImage[] | null;
  /** Total number of pages for pagination */
  totalPages?: number;
  /** Current page number */
  page: number;
  /** Whether to show the search component */
  hasSearch?: boolean;
};

/**
 * Collection Component
 *
 * A component that displays a grid of transformed images with pagination.
 * Each image is displayed as a card with its title and transformation type icon.
 *
 * Key Features:
 * - Paginated image grid display
 * - Optional search functionality
 * - Image cards with transformation type indicators
 * - Responsive layout
 * - Empty state handling
 *
 * Usage Context:
 * This component is used to display collections of transformed images,
 * typically in the user's gallery or search results.
 */
export const Collection = ({ hasSearch = false, images, totalPages = 1, page }: CollectionProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // PAGINATION HANDLER
  const onPageChange = (action: string) => {
    const pageValue = action === "next" ? Number(page) + 1 : Number(page) - 1;

    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: "page",
      value: pageValue,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <>
      <div className="collection-heading">
        <h2 className="h2-bold text-primary">Recent Edits</h2>
        {hasSearch && <Search />}
      </div>

      {images && images.length > 0 ? (
        <ul className="collection-list">
          {images.map(image => (
            <Card image={image} key={image._id as string} />
          ))}
        </ul>
      ) : (
        <div className="collection-empty">
          <p className="p-20-semibold">Empty List</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent className="flex w-full">
            <Button
              disabled={Number(page) <= 1}
              className="collection-btn disabled:cursor-not-allowed cursor-pointer"
              onClick={() => onPageChange("prev")}
            >
              <PaginationPrevious className="hover:bg-transparent hover:text-secondary" />
            </Button>

            <p className="flex-center p-16-medium w-fit flex-1">
              {page} / {totalPages}
            </p>

            <Button
              className="button w-32  bg-cover text-secondary disabled:cursor-not-allowed cursor-pointer"
              onClick={() => onPageChange("next")}
              disabled={Number(page) >= totalPages}
            >
              <PaginationNext className="hover:bg-transparent hover:text-secondary" />
            </Button>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

/**
 * Card Component
 *
 * A subcomponent that renders an individual transformed image card.
 * Displays the image with its transformation type icon and title.
 *
 * @param {Object} props - Component props
 * @param {TImage} props.image - The image data to display
 */
const Card = ({ image }: { image: TImage }) => {
  const recolor = { ...image.config?.recolor, to: image.config?.recolor?.to?.replace("#", "") };

  return (
    <li>
      <Link href={`/transformations/${image._id}`} className="collection-card">
        <CldImage
          src={image.publicId}
          alt={image.title}
          width={image.width}
          height={image.height}
          placeholder={dataUrl as PlaceholderValue}
          {...image.config}
          recolor={recolor}
          loading="lazy"
          className="h-52 w-full rounded-[10px] object-cover"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
        <div className="flex-between">
          <p className="p-20-semibold mr-3 line-clamp-1 text-primary">{image.title}</p>
          <Image
            src={`/assets/icons/${transformationTypes[image.transformationType as TransformationTypeKey]?.icon}`}
            title={image.transformationType}
            alt={image.title}
            className={"dark:filter dark:invert dark:brightness-200"}
            width={24}
            height={24}
          />
        </div>
      </Link>
    </li>
  );
};
