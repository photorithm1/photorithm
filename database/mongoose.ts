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
      dbName: process.env.MONGODB_DATABASE_NAME!,
      bufferCommands: false,
    });

  cached.conn = await cached.promise;
  return cached.conn;
}
