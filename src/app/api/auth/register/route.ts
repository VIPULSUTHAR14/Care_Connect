import { NextRequest, NextResponse } from "next/server";
import { getCollectionByUserType } from "@/lib/ConnectDB";
import { UserType } from "@/types/user";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      userType: receivedUserType, 
      phone, 
      address, 
      specialization, 
      licenseNumber, 
      hospitalName, 
      pharmacyName 
    } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For this endpoint (patient register), force user type to PATIENT
    const userType = UserType.PATIENT;

    // Get the appropriate collection based on user type
    const collection = await getCollectionByUserType(userType);

    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data based on user type
    let userData: any = {
      name,
      email,
      password: hashedPassword,
      userType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add patient specific defaults (this endpoint is patient-only)
    userData = {
      ...userData,
      mobileNumber: "",
      age: null,
      gender: "",
      role: "patient",
      address: "",
      bloodGroup: "",
      pastReports: [],
      family: [],
      isActive: true,
      profileCompleted: false,
    };

    // Insert the new user
    const result = await collection.insertOne(userData);

    if (result.insertedId) {
      // Remove password from response
      const { password: _, ...userWithoutPassword } = userData;
      
      return NextResponse.json({
        message: "User created successfully",
        user: {
          ...userWithoutPassword,
          _id: result.insertedId,
        },
        userType,
        collection: userType === UserType.PATIENT ? "patients" : 
                   userType === UserType.DOCTOR ? "doctors" :
                   userType === UserType.HOSPITAL ? "hospitals" : "pharmacy"
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
