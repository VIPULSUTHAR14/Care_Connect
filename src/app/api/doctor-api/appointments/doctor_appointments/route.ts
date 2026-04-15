import { NextResponse } from "next/server";
import { getDatabase, UserType } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    // 1. Authenticate the session and ensure the user is a doctor
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.userType !== UserType.DOCTOR) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const appointmentsCollection = db.collection("appointments");

    const doctorId = new ObjectId(session.user.id);

    // 2. Find all appointments where 'doctorId' matches the logged-in doctor's ID
    const appointments = await appointmentsCollection
      .find({
        doctorId: doctorId, // Filter by the doctor's ID
      })
      .sort({ createdAt: -1 }) // Show the most recent appointments first
      .toArray();

    // 3. Return the found appointments
    return NextResponse.json({ appointments }, { status: 200 });

  } catch (error: any) {
    console.error("Failed to fetch doctor's appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}