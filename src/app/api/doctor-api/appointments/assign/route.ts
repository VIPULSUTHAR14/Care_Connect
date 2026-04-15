// /app/api/appointments/assign/route.ts
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function PATCH(request: Request) {
  console.log("--- API Route /api/appointments/assign HIT ---");
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.userType !== "hospital") {
      console.error("Authorization failed: No valid hospital session.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId, doctorId } = await request.json();
    console.log(`Assigning Appointment ID: ${appointmentId} to Doctor ID: ${doctorId}`);

    if (!appointmentId || !doctorId) {
      console.error("Validation failed: Missing appointmentId or doctorId.");
      return NextResponse.json(
        { error: "Missing appointmentId or doctorId" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const appointmentsCollection = db.collection("appointments");
    const usersCollection = db.collection("doctors"); // Ensure 'users' is your doctors' collection name

    const appointmentObjectId = new ObjectId(appointmentId);
    const doctorObjectId = new ObjectId(doctorId);

    // Step 1: Add the appointmentId to the doctor's record
    console.log(`Attempting to update doctor: ${doctorObjectId}`);
    const doctorUpdateResult = await usersCollection.updateOne(
      { _id: doctorObjectId },
      // Ensure the array field in your DB is named 'appointments'
      { $set: { appointments: appointmentObjectId } }
    );

    console.log("Doctor update result:", doctorUpdateResult);
    if (doctorUpdateResult.modifiedCount === 0) {
      // This is a common failure point. It means no document with that doctorId was found.
      throw new Error(`Could not find doctor with ID ${doctorId} to update.`);
    }

    // Step 2: Update the appointment with the doctorId and change its status
    console.log(`Attempting to update appointment: ${appointmentObjectId}`);
    const appointmentUpdateResult = await appointmentsCollection.updateOne(
      { _id: appointmentObjectId },
      { $set: { doctorId: doctorObjectId, status: "approved" } }
    );

    console.log("Appointment update result:", appointmentUpdateResult);
    if (appointmentUpdateResult.modifiedCount === 0) {
      throw new Error(`Could not find appointment with ID ${appointmentId} to update.`);
    }

    console.log("Successfully assigned appointment.");
    return NextResponse.json(
      { message: "Appointment assigned successfully" },
      { status: 200 }
    );
  } catch (error) {
    // This will print the specific, detailed error to your server terminal
    console.error("!!! CRITICAL ERROR in /api/appointments/assign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}