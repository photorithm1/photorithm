/**
 * @route POST /api/webhooks/clerk
 *
 * Handles incoming user-related webhook events from Clerk.
 *
 * This route listens for events from Clerk such as:
 * - `user.created`: Triggered when a new user is created in Clerk.
 * - `user.updated`: Triggered when an existing user's information is updated.
 * - `user.deleted`: Triggered when a user is deleted from Clerk.
 *
 * Actions Taken:
 * - Verifies the authenticity of the webhook using Svix headers (`svix-id`, `svix-timestamp`, `svix-signature`).
 * - For `user.created`: Creates a corresponding user in the local database and attaches the internal user ID
 *   to Clerk's public metadata.
 * - For `user.updated`: Updates the user’s information in the local database.
 * - For `user.deleted`: Removes the user record from the local database.
 *
 * Security:
 * - Validates the webhook request with a shared secret (`WEBHOOK_SECRET`) from Clerk.
 * - Rejects any request with missing or invalid Svix headers.
 *
 * Setup Instructions:
 * - Set the webhook secret in `.env.local` as `WEBHOOK_SECRET`.
 * - Register this endpoint in the Clerk dashboard under Webhooks.
 *
 * Recommended Usage:
 * - This endpoint must be protected from public misuse and should only accept POST requests from Clerk.
 */
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/actions/user.action";

export async function POST(req: Request) {
  /**
   * Webhook secret from Clerk dashboard, used to verify authenticity.
   * Must be set in `.env.local` as `WEBHOOK_SECRET`.
   */
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  /**
   * Attempt to verify the webhook payload using the Svix signature headers
   */
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  /**
   * Handle "user.created" event
   * - Extracts relevant user data from Clerk
   * - Creates a new user in the local database
   * - Sets Clerk public metadata with internal user ID
   */
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name!, // can be null
      lastName: last_name!, // can be null
      photo: image_url,
    };

    const newUser = await createUser(user);

    // Set public metadata
    if (newUser) {
      (await clerkClient()).users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }

    return NextResponse.json({ message: "OK", user: newUser });
  }

  /**
   * Handle "user.updated" event
   * - Updates user information in the local database
   */
  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data;

    const user = {
      firstName: first_name!, // can be null
      lastName: last_name!, // can be null
      username: username!,
      photo: image_url,
    };

    const updatedUser = await updateUser(id, user);

    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  /**
   * Handle "user.deleted" event
   * - Deletes the user from the local database
   */
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    const deletedUser = await deleteUser(id!);

    return NextResponse.json({ message: "OK", user: deletedUser });
  }

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  return new Response("", { status: 200 });
}
