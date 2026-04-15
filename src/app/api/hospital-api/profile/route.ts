import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

// Only allow GET requests to this route
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        // If not authenticated as hospital, return 401 (Unauthorized)
        if (!session || !session.user || session.user.userType !== "hospital") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const db = await getDatabase();
        const hospitals = db.collection("Hospital");

        const hospitalId = session.user.id;
        if (!hospitalId) {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 400 }
            );
        }

        let hospitalData;
        try {
            hospitalData = await hospitals.findOne({ _id: new ObjectId(hospitalId) });
        } catch (err) {
            return NextResponse.json(
                { error: "Invalid hospital ID" },
                { status: 400 }
            );
        }

        if (!hospitalData) {
            return NextResponse.json(
                { error: "Hospital not found" },
                { status: 404 }
            );
        }

        // Remove sensitive fields
        if ("password" in hospitalData) {
            delete hospitalData.password;
        }

        return NextResponse.json(
            { hospital: hospitalData },
            { status: 200 }
        );
    } catch (error) {
        // Log the error for debugging
        console.error("Error fetching hospital profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
