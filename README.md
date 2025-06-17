# Photorithm - AI-Powered Image Transformation Platform

A Next.js application that leverages AI to transform images with features like background removal, object removal, color adjustments, and more. Built with modern web technologies and integrated with Cloudinary for image processing.

## Features

- **Multiple Transformation Types**
  - Image Restoration
  - Background Removal
  - Object Removal
  - Object Recoloring
  - Generative Fill
  - Background Replacement

- **User Management**
  - Authentication with Clerk
  - User profiles
  - Credit system for transformations
  - Transaction history

- **Image Management**
  - Secure image uploads
  - Real-time transformation preview
  - Download transformed images
  - Private/public image settings
  - Image collection management

## Tech Stack

- **Frontend**
  - Next.js 15 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui Components

- **Backend**
  - Next.js 15 Server Actions
  - Next.js API Routes
  - MongoDB with Mongoose
  - Cloudinary for image processing
  - Clerk for authentication
  - Stripe for payments

## Prerequisites

Before running the application, ensure you have:

1. **Cloudinary Account**
   - Create an account at [Cloudinary](https://cloudinary.com)
   - Set up an upload preset with the following settings:
     - Signing Mode: Unsigned
     - Folder: Your preferred folder name
     - Auto Tagging: Enabled (for better image analysis)
     - Moderation: Optional (based on your needs)

2. **MongoDB Database**
   - Create a MongoDB database
   - Get your connection string

3. **Clerk Account**
   - Create an account at [Clerk](https://clerk.com)
   - Set up your application
   - Configure webhook endpoints for the following events:
     - `user.created` - For creating new user records
     - `user.updated` - For updating user profiles
     - `user.deleted` - For cleaning up user data

4. **Stripe Account**
   - Create an account at [Stripe](https://stripe.com)
   - Get your API keys
   - Set up webhook endpoints for the following event:
     - `checkout.session.completed` - For processing successful payments and updating user credits

## Important Note

This application uses webhooks for various functionalities. To run it locally, you'll need to expose your local endpoints to the internet. It's recommended to:

1. Deploy the application to a platform of your choice first
2. Use the deployed webhook URLs for your service configurations:
   - Clerk webhook URL: `https://your-domain.com/api/webhooks/clerk`
   - Stripe webhook URL: `https://your-domain.com/api/webhooks/stripe`
3. Then run the application locally for development

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URL=your_mongodb_connection_string
MONGODB_DATABASE_NAME=your_database_name

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_IMAGE_PRESET=your_upload_preset
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_IMAGE_FOLDER=your_folder_name

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── actions/           # Server actions for data operations
├── app/              # Next.js app router pages
├── components/       # React components
├── constants/        # Application constants
├── database/         # Database models and connection
├── lib/             # Utility functions
├── public/          # Static assets
└── types/           # TypeScript type definitions
```


