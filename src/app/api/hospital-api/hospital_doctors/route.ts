// src/app/api/doctors/route.ts

import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db"; // Your MongoDB connection helper
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
    try {
        // 1. Connect to the database
        const db = await getDatabase();
        const usersCollection = db.collection("doctors"); // Assuming doctors are in your 'users' collection

        // 2. Find all users with the role 'doctor'
        const doctors = await usersCollection
            .find({
                role: "doctor", // Filter by the role field
            })
            .project({
                password: 0, // IMPORTANT: Exclude the password field from the results
            })
            .toArray();

        // 3. Return the list of doctors
        return NextResponse.json({ doctors }, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch doctors:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}