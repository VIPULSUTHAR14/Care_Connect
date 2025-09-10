import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCollectionByUserType } from "@/lib/ConnectDB";
import { UserType } from "@/types/user";

export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.userType !== UserType.PATIENT) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      mobileNumber,
      age,
      gender,
      role,
      address,
      bloodGroup,
      pastReports,
      family
    } = body;

    // Get the patient collection
    const collection = await getCollectionByUserType(UserType.PATIENT);

    // Update the patient profile
    const result = await collection.updateOne(
      { email: session.user?.email },
      {
        $set: {
          mobileNumber: mobileNumber || "",
          age: age || null,
          gender: gender || "",
          role: role || "",
          address: address || "",
          bloodGroup: bloodGroup || "",
          pastReports: pastReports || [],
          family: family || [],
          profileCompleted: true,
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      updated: result.modifiedCount > 0
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.userType !== UserType.PATIENT) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the patient collection
    const collection = await getCollectionByUserType(UserType.PATIENT);

    // Find the patient
    const patient = await collection.findOne(
      { email: session.user?.email },
      { projection: { password: 0 } } // Exclude password from response
    );

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      patient
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
