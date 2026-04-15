import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      address,
      reception_number,
      ambulance_number,
      nha_registration_number,
      role,
      images,
    } = body;

    // Check required fields
    if (!name || !email || !password || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection("Hospital");

    // Check if hospital already exists
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Hospital already registered with this email" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const hospital = {
      name,
      email,
      password: hashedPassword,
      address,
      reception_number: reception_number || "",
      ambulance_number: ambulance_number || "",
      nha_registration_number: nha_registration_number || "",
      userType: role || "Hospital",
      createdAt: new Date(),
      images: Array.isArray(images) ? images : [],
      staff: [], // Add an empty section for staff in the hospital
    };

    const result = await users.insertOne(hospital);

    return NextResponse.json(
      {
        message: "Hospital registered successfully",
        hospitalId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
