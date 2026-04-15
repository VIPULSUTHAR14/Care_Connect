import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Doctor schedule registration API route
export async function POST(req: NextRequest) {
  try {
    // Authenticate doctor
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== "doctor") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { doctorId, day, startTime, endTime, location, notes } = body;

    // Basic validation
    if (!doctorId || !day || !startTime || !endTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    if (startTime >= endTime) {
      return NextResponse.json({ message: "Start time must be before end time" }, { status: 400 });
    }

    // Connect to DB
    const db = await getDatabase();
    const schedules = db.collection("doctor_schedules");
    const doctors = db.collection("doctors");

    // Upsert schedule for the doctor for the given day in doctor_schedules collection
    await schedules.updateOne(
      { doctorId, day },
      {
        $set: {
          doctorId,
          day,
          startTime,
          endTime,
          location: location || "",
          notes: notes || "",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Also update the doctor object in the doctors collection to store the schedule
    // We'll store schedules as an array of objects, one per day
    await doctors.updateOne(
      { _id: doctorId },
      {
        $pull: { schedules: { day } } as any, // Remove any existing schedule for this day
      }
    );
    await doctors.updateOne(
      { _id: doctorId },
      {
        $push: {
          schedules: {
            day,
            startTime,
            endTime,
            location: location || "",
            notes: notes || "",
            updatedAt: new Date(),
          },
        } as any,
      },
      { upsert: false }
    );

    return NextResponse.json({ message: "Schedule saved successfully" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
