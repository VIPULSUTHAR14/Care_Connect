import { NextRequest, NextResponse } from "next/server";
import { getCollectionByUserType } from "@/lib/ConnectDB";
import { UserType } from "@/types/user";
import bcrypt from "bcryptjs";
import { Document } from "mongodb"; // Import the Document type

// Define a more specific type for the user data
interface PatientData extends Document {
  name: string;
  email: string;
  password: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
  mobileNumber: string;
  age: number | null;
  gender: string;
  role: string;
  address: string;
  bloodGroup: string;
  pastReports: unknown[];
  family: unknown[];
  isActive: boolean;
  profileCompleted: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Only destructure fields that are actually used
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // This endpoint is for patient registration only
    const userType = UserType.PATIENT;
    const collection = await getCollectionByUserType(userType);

    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // FIX: Combine object creation and use the specific PatientData interface
    const userData: PatientData = {
      name,
      email,
      password: hashedPassword,
      userType,
      createdAt: new Date(),
      updatedAt: new Date(),
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

    const result = await collection.insertOne(userData);

    if (result.insertedId) {
      const { password: _, ...userWithoutPassword } = userData;
      
      return NextResponse.json({
        message: "User created successfully",
        user: {
          ...userWithoutPassword,
          _id: result.insertedId,
        },
        userType,
        collection: "patients"
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  } catch (error: unknown) { // Bonus fix: Type the error as 'unknown'
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}