// src/app/api/hospital/doctors/route.ts
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    // 1. Get the current session and verify the user is a hospital
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.userType !== "hospital") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Connect to the database
    const db = await getDatabase();
    const doctorsCollection = db.collection("doctors");

    // 3. Find all doctors whose currentHospitalId matches the hospital's id
    const hospitalId = session.user.id;
    let hospitalObjectId: ObjectId;
    try {
      hospitalObjectId = new ObjectId(hospitalId);
    } catch (e) {
      return NextResponse.json({ error: "Invalid hospital id" }, { status: 400 });
    }

    const doctors = await doctorsCollection
      .find({
        currentHospitalId: hospitalObjectId,
      })
      .project({ password: 0 })
      .toArray();

    return NextResponse.json({ doctors }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch hospital's doctors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}