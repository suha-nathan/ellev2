import mongoose from "mongoose";

const AGGREGATOR_URI = process.env.MONGO_RESOURCE_URI!;

let connection: mongoose.Connection | null = null;

export async function connectAggregatorDB(): Promise<mongoose.Connection> {
  if (!connection) {
    connection = await mongoose
      .createConnection(AGGREGATOR_URI, {
        dbName: "learning_resources",
      })
      .asPromise();
  }
  return connection;
}
