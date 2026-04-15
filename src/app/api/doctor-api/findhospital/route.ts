import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET() {
    try {
        const db = await getDatabase();
        const hospitals = db.collection("Hospital");
        const list = await hospitals
            .find({}, { projection: { _id: 1, name: 1 } })
            .sort({ name: 1 })
            .toArray();

        return NextResponse.json(
            {
                hospitals: list.map((h) => ({ id: h._id, name: h.name.trim() })),
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
    }
}