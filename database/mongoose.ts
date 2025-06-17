/**
 *
 * Establishes and caches a single Mongoose connection across the server runtime.
 *
 * Why Caching?
 * - Next.js (especially with App Router and serverless functions) can re-run code frequently.
 * - To avoid creating multiple DB connections on hot reloads or in serverless environments, we cache the connection.
 *
 * Usage:
 * - Call `connectToDatabase()` in any server-side action or route before accessing models.
 *
 * Environment Variables:
 * - `MONGODB_URL`: Connection URI to MongoDB.
 * - `MONGODB_DATABASE_NAME`: (Optional) Custom DB name; defaults to "photorithm".
 */
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URL) throw new Error("MONGODB_URL not found");

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: process.env.MONGODB_DATABASE_NAME || "photorithm",
      bufferCommands: false,
    });

  cached.conn = await cached.promise;
  return cached.conn;
}
