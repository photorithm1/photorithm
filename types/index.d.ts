/**
 * Type definitions for the application.
 *
 * This file contains TypeScript type definitions used throughout the application,
 * including user, image, transaction, and form-related types.
 */

/**
 * Parameters for creating a new user
 * Used in Clerk webhook handler when a new user signs up
 */
declare type CreateUserParams = {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
};

/**
 * Parameters for updating an existing user
 * Used in Clerk webhook handler when user profile is updated
 */
declare type UpdateUserParams = {
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
};

// ====== IMAGE PARAMS
/**
 * Parameters for adding a new image
 * Used in image transformation workflow
 */
declare type AddImageParams = {
  image: {
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: Transformations;
    secureURL: string;
    transformationURL: string;
    aspectRatio: string | undefined;
    prompt: string | undefined;
    color: string | undefined;
    isPrivate: boolean;
  };
  userId: string;
  path: string;
};

/**
 * Parameters for updating an existing image
 * Used in image transformation workflow
 */
declare type UpdateImageParams = {
  image: {
    _id: string;
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: Transformations;
    secureURL: string;
    transformationURL: string;
    aspectRatio: string | undefined;
    prompt: string | undefined;
    color: string | undefined;
    isPrivate?: boolean;
  };
  userId: string;
  path: string;
};

/**
 * Configuration options for image transformations
 * Used in TransformationForm and TransformedImage components
 */
declare type Transformations = {
  restore?: boolean;
  fillBackground?: boolean;
  remove?: {
    prompt: string;
    removeShadow?: boolean;
    multiple?: boolean;
  };
  recolor?: {
    prompt?: string;
    to: string;
    multiple?: boolean;
  };
  removeBackground?: boolean;
  replaceBackground?: {
    prompt: string;
  };
};

// ====== TRANSACTION PARAMS
/**
 * Parameters for initiating a credit purchase transaction
 * Used in Checkout component and Stripe integration
 */
declare type CheckoutTransactionParams = {
  plan: string;
  credits: number;
  amount: number;
  buyerId: string;
  successURL: string;
  cancelURL: string;
};

/**
 * Parameters for creating a transaction record
 * Used in Stripe webhook handler after successful payment
 */
declare type CreateTransactionParams = {
  stripeId: string;
  amount: number;
  credits: number;
  plan: string;
  buyerId: string;
  createdAt: Date;
};

/**
 * Valid transformation type keys
 * Used for type safety in transformation-related components
 */
declare type TransformationTypeKey =
  | "restore"
  | "fill"
  | "remove"
  | "recolor"
  | "removeBackground"
  | "replaceBackground";

// ====== URL QUERY PARAMS
/**
 * Parameters for updating URL query parameters
 * Used in pagination and filtering
 */
declare type FormUrlQueryParams = {
  searchParams: string;
  key: string;
  value: string | number | null;
};

/**
 * Parameters for URL query manipulation
 * Used in navigation and state management
 */
declare type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

/**
 * Parameters for removing URL query parameters
 * Used in cleaning up URL state
 */
declare type RemoveUrlQueryParams = {
  searchParams: string;
  keysToRemove: string[];
};

/**
 * Props for pages with search parameters
 * Used in dynamic route pages
 */
declare type SearchParamProps = {
  params: Promise<{ id: string; type: TransformationTypeKey }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Props for the TransformationForm component
 * Used in image transformation workflow
 */
declare type TransformationFormProps = {
  action: "Add" | "Update";
  userId: string;
  type: TransformationTypeKey;
  creditBalance: number;
  data: TImage | null;
  config?: Transformations | null;
};

/**
 * Props for the TransformedImage component
 * Used in image transformation preview
 */
declare type TransformedImageProps = {
  image: TImage | null;
  type: string;
  title: string;
  transformationConfig: Transformations | null;
  isTransforming: boolean;
  hasDownload?: boolean;
  setIsTransforming?: React.Dispatch<React.SetStateAction<boolean>>;
  setError?: React.Dispatch<React.SetStateAction<Error | null>>;
};

/**
 * Image data structure
 * Used throughout the application for image management
 */
declare type TImage = {
  _id?: string;
  title: string;
  publicId: string;
  author: string | TUser;
  transformationType: string;
  width: number;
  height: number;
  config: Transformations | null;
  secureURL: string;
  transformationURL: string;
  aspectRatio: string | undefined;
  prompt: string | undefined;
  color: string | undefined;
  isPrivate: boolean;
};

/**
 * User data structure
 * Used throughout the application for user management
 */
declare type TUser = {
  _id: string;
  clerkId: string;
  email: string;
  username: string;
  photo: string;
  firstName?: string;
  lastName?: string;
  planId: number;
  creditBalance: number;
};
