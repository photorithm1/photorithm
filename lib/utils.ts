/**
 * Utility functions for the application.
 *
 * This module provides various utility functions used throughout the application:
 * - Class name merging for Tailwind CSS
 * - Error handling
 * - Image placeholder generation
 * - URL query parameter manipulation
 * - Image size calculations
 * - Image download functionality
 * - Deep object comparison and merging
 */

import { type ClassValue, clsx } from "clsx";
import qs from "qs";
import { twMerge } from "tailwind-merge";

import { aspectRatioOptions } from "@/constants";

/**
 * Merges class names using clsx and tailwind-merge.
 * Used for combining Tailwind CSS classes with conditional classes.
 *
 * @param inputs - Class names to merge
 * @returns Merged class names string
 *
 * @example
 * ```tsx
 * // Input: cn("bg-blue-500", "hover:bg-blue-600", "text-white")
 * // Returns: "bg-blue-500 hover:bg-blue-600 text-white"
 *
 * // Input: cn("bg-blue-500 text-red-500", "text-white")
 * // Returns: "bg-blue-500 text-white" (text-red-500 is overridden)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ERROR HANDLER
/**
 * Standardized error handler for the application.
 * Handles different types of errors (Error objects, strings, unknown types)
 * and formats them consistently.
 *
 * @param error - The error to handle. Can be Error object, string, or unknown type
 * @throws {Error} A formatted error message
 *
 * @example
 * ```ts
 * // Input: handleError(new Error("Invalid input"))
 * // Throws: Error: Invalid input
 *
 * // Input: handleError("Database connection failed")
 * // Throws: Error: Database connection failed
 *
 * // Input: handleError({ code: 500 })
 * // Throws: Error: Unknown error: {"code":500}
 * ```
 */
export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    // This is a native JavaScript error (e.g., TypeError, RangeError)
    console.error(error.message);
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    // This is a string error message
    console.error(error);
    throw new Error(`Error: ${error}`);
  } else {
    // This is an unknown type of error
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};

// PLACEHOLDER LOADER - while image is transforming
/**
 * Generates an SVG placeholder for images while they are being transformed.
 * Creates a shimmer effect using SVG animations.
 *
 * @param w - Width of the placeholder
 * @param h - Height of the placeholder
 * @returns SVG string with shimmer animation
 *
 * @example
 * ```ts
 * // Input: shimmer(100, 100)
 * // Returns: "<svg width="100" height="100" ...>"
 * // (SVG string with shimmer animation)
 * ```
 */
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1a1a1a" offset="20%" />
      <stop stop-color="#2a2a2a" offset="50%" />
      <stop stop-color="#1a1a1a" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#121212" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite" />
</svg>`;

/**
 * Converts a string to base64, handling both server and client environments.
 *
 * @param str - String to convert to base64
 * @returns Base64 encoded string
 *
 * @example
 * ```ts
 * // Input: toBase64("Hello World")
 * // Returns: "SGVsbG8gV29ybGQ="
 *
 * // Input: toBase64("photorithm")
 * // Returns: "cGhvdG9yaXRobQ=="
 * ```
 */
const toBase64 = (str: string) =>
  typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);

/**
 * Base64 encoded SVG placeholder for images.
 * Used as a loading state while images are being transformed.
 *
 * @example
 * ```ts
 * // Returns: "data:image/svg+xml;base64,..." (base64 encoded SVG)
 * dataUrl
 * ```
 */
export const dataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(1000, 1000))}`;

// ==== End

// FORM URL QUERY
/**
 * Updates URL query parameters while preserving existing ones.
 * Used for maintaining state in the URL for pagination and filters.
 *
 * @param params - Object containing searchParams, key, and value
 * @param params.searchParams - Current URL search parameters
 * @param params.key - Query parameter key to update
 * @param params.value - New value for the query parameter
 * @returns Updated URL with new query parameters
 *
 * @example
 * ```ts
 * // Input: formUrlQuery({
 * //   searchParams: new URLSearchParams("?page=1&filter=active"),
 * //   key: "page",
 * //   value: "2"
 * // })
 * // Returns: "/current/path?page=2&filter=active"
 *
 * // Input: formUrlQuery({
 * //   searchParams: new URLSearchParams("?type=fill"),
 * //   key: "width",
 * //   value: "800"
 * // })
 * // Returns: "/current/path?type=fill&width=800"
 * ```
 */
export const formUrlQuery = ({ searchParams, key, value }: FormUrlQueryParams) => {
  const params = { ...qs.parse(searchParams.toString()), [key]: value };

  return `${window.location.pathname}?${qs.stringify(params, {
    skipNulls: true,
  })}`;
};

// REMOVE KEY FROM QUERY
/**
 * Removes specified keys from URL query parameters.
 * Used for cleaning up URL state when filters are removed.
 *
 * @param params - Object containing searchParams and keysToRemove
 * @param params.searchParams - Current URL search parameters
 * @param params.keysToRemove - Array of keys to remove from URL
 * @returns Updated URL with specified keys removed
 *
 * @example
 * ```ts
 * // Input: removeKeysFromQuery({
 * //   searchParams: new URLSearchParams("?page=1&filter=active&sort=desc"),
 * //   keysToRemove: ["filter", "sort"]
 * // })
 * // Returns: "/current/path?page=1"
 *
 * // Input: removeKeysFromQuery({
 * //   searchParams: new URLSearchParams("?type=fill&width=800&height=600"),
 * //   keysToRemove: ["width", "height"]
 * // })
 * // Returns: "/current/path?type=fill"
 * ```
 */
export function removeKeysFromQuery({ searchParams, keysToRemove }: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(searchParams);

  keysToRemove.forEach(key => {
    delete currentUrl[key];
  });

  // Remove null or undefined values
  Object.keys(currentUrl).forEach(key => currentUrl[key] == null && delete currentUrl[key]);

  return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
}

export type AspectRatioKey = keyof typeof aspectRatioOptions;

// GE IMAGE SIZE
/**
 * Calculates image dimensions based on transformation type and aspect ratio.
 * Used for maintaining proper image dimensions during transformations.
 *
 * @param type - Type of transformation (e.g., 'fill')
 * @param image - Image object containing dimensions and aspect ratio
 * @param dimension - Which dimension to calculate ('width' or 'height')
 * @returns Calculated dimension value
 *
 * @example
 * ```ts
 * // Input: getImageSize('fill', { width: 800, height: 600, aspectRatio: '1:1' }, 'width')
 * // Returns: 1000 (from aspectRatioOptions)
 *
 * // Input: getImageSize('removeBackground', { width: 800, height: 600 }, 'height')
 * // Returns: 600 (original height)
 * ```
 */
export const getImageSize = (type: string, image: TImage, dimension: "width" | "height"): number => {
  if (type === "fill") {
    return aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimension] || 1000;
  }
  return image?.[dimension] || 1000;
};

// DOWNLOAD IMAGE
/**
 * Downloads an image from a URL and saves it with the specified filename.
 * Used for saving transformed images to the user's device.
 *
 * @param url - URL of the image to download
 * @param filename - Name to save the file as
 * @throws {Error} If URL is not provided
 *
 * @example
 * ```ts
 * // Input: download("https://example.com/image.jpg", "transformed-image")
 * // Downloads the image and saves it as "transformed-image.png"
 *
 * // Input: download("https://example.com/photo.png", "my photo")
 * // Downloads the image and saves it as "my_photo.png"
 * ```
 */
export const download = (url: string, filename: string) => {
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }

  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;

      if (filename && filename.length) a.download = `${filename.replace(" ", "_")}.png`;
      document.body.appendChild(a);
      a.click();
    })
    .catch(error => console.log({ error }));
};

// DEEP MERGE OBJECTS
/**
 * Deep merges two objects, preserving nested structures.
 * Used for combining transformation configurations.
 *
 * @param obj1 - First object to merge
 * @param obj2 - Second object to merge
 * @returns Merged object with combined properties
 *
 * @example
 * ```ts
 * // Input: deepMergeObjects(
 * //   { fill: { color: 'red' } },
 * //   { fill: { opacity: 0.5 } }
 * // )
 * // Returns: { fill: { color: 'red', opacity: 0.5 } }
 *
 * // Input: deepMergeObjects(
 * //   { user: { name: 'John' } },
 * //   { user: { age: 30 } }
 * // )
 * // Returns: { user: { name: 'John', age: 30 } }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepMergeObjects = (obj1: any, obj2: any) => {
  if (obj2 === null || obj2 === undefined) {
    return obj1;
  }

  const output = { ...obj2 };

  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (obj1[key] && typeof obj1[key] === "object" && obj2[key] && typeof obj2[key] === "object") {
        output[key] = deepMergeObjects(obj1[key], obj2[key]);
      } else {
        output[key] = obj1[key];
      }
    }
  }

  return output;
};

/**
 * Performs a deep equality check between two objects.
 * Used for comparing transformation configurations.
 *
 * @param obj1 - First object to compare
 * @param obj2 - Second object to compare
 * @returns True if objects are deeply equal, false otherwise
 *
 * @example
 * ```ts
 * // Input: deepEqual(
 * //   { fill: { color: 'red' } },
 * //   { fill: { color: 'red' } }
 * // )
 * // Returns: true
 *
 * // Input: deepEqual(
 * //   { fill: { color: 'red' } },
 * //   { fill: { color: 'blue' } }
 * // )
 * // Returns: false
 *
 * // Input: deepEqual(
 * //   { user: { name: 'John' } },
 * //   { user: { name: 'John' } }
 * // )
 * // Returns: true
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => deepEqual(obj1[key], obj2[key]));
}
