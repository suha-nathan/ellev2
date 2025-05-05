import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI as string);
const clientPromise = client.connect();

export default clientPromise;
