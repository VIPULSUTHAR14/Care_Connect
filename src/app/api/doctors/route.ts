import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/ConnectDB"

export async function GET() {
  try {
    const db = await getDatabase();
    const doctors = await db.collection("doctors").find({}).toArray();
    return NextResponse.json({ success: true, data: doctors });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctors", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
