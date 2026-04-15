import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const patientId = String(body.patientId || "").trim();
    const hospitalId = String(body.hospitalId || "").trim();
    const note = body.note ? String(body.note) : undefined;
    const sourceNotificationId = body.sourceNotificationId ? String(body.sourceNotificationId) : undefined;

    if (!patientId || !hospitalId) {
      return NextResponse.json({ error: "Missing patientId or hospitalId" }, { status: 400 });
    }

    const db = await getDatabase();
    const appointments = db.collection("appointments");

    const doc = {
      patientId,
      hospitalId,
      status: "pending" as const,
      note,
      sourceNotificationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await appointments.insertOne(doc);

    return NextResponse.json({ ok: true, appointmentId: String(result.insertedId) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create appointment" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = String(searchParams.get("hospitalId") || "").trim();
    const patientId = String(searchParams.get("patientId") || "").trim();

    const db = await getDatabase();
    const appointments = db.collection("appointments");

    const filter: Record<string, any> = {};
    if (hospitalId) filter.hospitalId = hospitalId;
    if (patientId) filter.patientId = patientId;

    const docs = await appointments
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({ appointments: docs });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: "Missing appointmentId or status" },
        { status: 400 }
      );
    }

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(appointmentId);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid appointment ID format" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const appointments = db.collection("appointments");

    const result = await appointments.updateOne(
      { _id: objectId },
      {
        $set: {
          status,
          updatedAt: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Appointment updated successfully" });
  } catch (e: any) {
    console.error("Appointment update error:", e);
    return NextResponse.json({ error: e?.message || "Failed to update appointment" }, { status: 500 });
  }
}


