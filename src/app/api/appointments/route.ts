import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/ConnectDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const isPatient = user && (user.userType === "patient" || user.role === "patient");
    if (!session || !user || !isPatient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const appointmentsCollection = db.collection("appointments");

    const userId: string = String(user.id);
    const patientIdVariants: any[] = [];
    if (ObjectId.isValid(userId)) patientIdVariants.push(new ObjectId(userId));
    patientIdVariants.push(userId);

    const appointments = await appointmentsCollection
      .find({ patientId: { $in: patientIdVariants } })
      .sort({ createdAt: -1, _id: -1 })
      .toArray();

    const serialized = appointments.map((a: any) => ({
      _id: String(a._id),
      hospitalId: a.hospitalId ? String(a.hospitalId) : undefined,
      status: a.status || "pending",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new ObjectId(String(a._id)).getTimestamp(),
    }));

    return NextResponse.json({ appointments: serialized }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch patient's appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}