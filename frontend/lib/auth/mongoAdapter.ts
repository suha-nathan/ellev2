import clientPromise from "@/lib/mongoClient";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

export const adapter = MongoDBAdapter(clientPromise);
