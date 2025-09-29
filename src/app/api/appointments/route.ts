// Import WithId and Document for better typing
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/ConnectDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId, WithId, Document } from "mongodb";

// Define a type for the user session object for type safety
interface UserSession {
  id: string;
  userType?: string;
  role?: string;
}

// FIX 1: Prefix unused 'request' parameter with an underscore
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // FIX 2: Cast to the specific UserSession type instead of any
    const user = session?.user as UserSession | undefined;
    const isPatient = user && (user.userType === "patient" || user.role === "patient");

    if (!session || !user || !isPatient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const appointmentsCollection = db.collection("appointments");

    const userId: string = String(user.id);
    // FIX 3: Use a more specific type for the array
    const patientIdVariants: (string | ObjectId)[] = [];
    if (ObjectId.isValid(userId)) patientIdVariants.push(new ObjectId(userId));
    patientIdVariants.push(userId);

    const appointments = await appointmentsCollection
      .find({ patientId: { $in: patientIdVariants } })
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    // FIX 4: Use the WithId<Document> type from the mongodb driver
    const serialized = appointments.map((a: WithId<Document>) => ({
      _id: String(a._id),
      hospitalId: a.hospitalId ? String(a.hospitalId) : undefined,
      status: a.status || "pending",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new ObjectId(String(a._id)).getTimestamp(),
    }));

    return NextResponse.json({ appointments: serialized }, { status: 200 });
  } catch (error: unknown) { // FIX 5: Use 'unknown' for caught errors
    console.error("Failed to fetch patient's appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}