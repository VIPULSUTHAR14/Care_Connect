import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { UserType } from "@/types/user";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.userType !== UserType.DOCTOR) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDatabase();
        const doctors = db.collection("doctors");

        const doctorId = session.user.id;
        if (!doctorId) {
            return NextResponse.json({ error: "Doctor ID not found in session" }, { status: 400 });
        }

        const doctorData = await doctors.findOne({ _id: new ObjectId(doctorId) });

        if (!doctorData) {
            return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        // Remove sensitive fields
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { password, ...safeDoctor } = (doctorData as any) || {};

        return NextResponse.json({ doctor: safeDoctor }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch doctor data" }, { status: 500 });
    }
}
