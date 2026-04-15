import { MongoClient, Db, Collection, Document } from "mongodb";

const uri = "mongodb+srv://Nabha_Healthcare_Admin:NABHA25018@nabha-healthcare.jy6v8po.mongodb.net/?retryWrites=true&w=majority&appName=nabha-healthcare";
const options = {};


export const DATABASE_NAME = "healthcare";

import { UserType, COLLECTION_MAPPING } from "@/types/user";


export { UserType, COLLECTION_MAPPING };


export const COLLECTION_NAME = "User";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {


  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env");
}

if (process.env.NODE_ENV === "development") {

  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {

  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}


export const getDatabase = async (): Promise<Db> => {
  const mongoClient = await clientPromise;
  return mongoClient.db(DATABASE_NAME);
};
export const getCollectionByUserType = async (userType: UserType): Promise<Collection<Document>> => {
  const db = await getDatabase();
  return db.collection(COLLECTION_MAPPING[userType]);
};
export default clientPromise;
