import { MongoClient, Db, Collection, Document } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

// Define your database and collection names here
export const DATABASE_NAME = "healthcare"; // Change as needed

import { UserType, COLLECTION_MAPPING } from "@/types/user";

// Re-export for backward compatibility
export { UserType, COLLECTION_MAPPING };

// Default collection (for backward compatibility)
export const COLLECTION_NAME = "User";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Helper to get the database
export const getDatabase = async (): Promise<Db> => {
  const mongoClient = await clientPromise;
  return mongoClient.db(DATABASE_NAME);
};

// Helper to get the collection
export const getCollection = async <T extends Document = Document>(collectionName?: string): Promise<Collection<T>> => {
  const db = await getDatabase();
  return db.collection<T>(collectionName || COLLECTION_NAME);
};

// Helper to get collection by user type
export const getCollectionByUserType = async <T extends Document = Document>(userType: UserType): Promise<Collection<T>> => {
  const db = await getDatabase();
  const collectionName = COLLECTION_MAPPING[userType];
  return db.collection<T>(collectionName);
};

// Helper to get collection name by user type
export const getCollectionNameByUserType = (userType: UserType): string => {
  return COLLECTION_MAPPING[userType];
};

export default clientPromise;
