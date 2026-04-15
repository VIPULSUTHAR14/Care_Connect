import { NextResponse } from "next/server";
import { getDatabase, UserType } from "@/lib/db";
import { hash } from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      nmcRegistrationNumber,
      department,
      qualification,
      medicalCollege,
      registrationYear,
      phoneNumber,
      address,
      stateMedicalCouncil,
      experience,
      currentHospital,
      emergencyContact,
      dateOfBirth,
      gender,
      bloodGroup,
    } = body;

    // TODO: Add schedule to the doctor registration process

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "password",
      "nmcRegistrationNumber",
      "department",
      "qualification",
      "medicalCollege",
      "registrationYear",
      "phoneNumber",
      "address",
      "stateMedicalCouncil",
      "experience",
      "emergencyContact",
      "dateOfBirth",
      "gender",
      "bloodGroup",
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Normalize NMC registration number (no regex validation)
    const normalizedNmc = String(nmcRegistrationNumber).trim().toUpperCase();

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Validate year of graduation
    const currentYear = new Date().getFullYear();
    const parsedRegistrationYear = parseInt(registrationYear);
    if (parsedRegistrationYear < 1950 || parsedRegistrationYear > currentYear) {
      return NextResponse.json(
        { error: "Invalid year of graduation" },
        { status: 400 }
      );
    }

    // Validate experience
    const expYears = parseInt(experience);
    if (expYears < 0 || expYears > 50) {
      return NextResponse.json(
        { error: "Invalid experience years" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const doctors = db.collection("doctors");
    const hospitals = db.collection("Hospital");

    // Check if doctor already exists with this email
    const existingDoctor = await doctors.findOne({ email });
    if (existingDoctor) {
      return NextResponse.json(
        { error: "Doctor already registered with this email" },
        { status: 409 }
      );
    }

    // Resolve currentHospital against registered hospitals if provided and not 'none'
    let currentHospitalId: ObjectId | null = null;
    let currentHospitalName: string | null = null;
    const providedHospital = (currentHospital || "").trim();
    if (providedHospital && providedHospital.toLowerCase() !== "none") {
      // Debug: Log the provided hospital name
      console.log("Looking for hospital:", JSON.stringify(providedHospital));

      // Try multiple matching strategies
      let foundHospital = null;

      // 1. Exact match (case-sensitive)
      foundHospital = await hospitals.findOne({ name: providedHospital });

      // 2. Exact match with trimmed database names
      if (!foundHospital) {
        foundHospital = await hospitals.findOne({
          $expr: { $eq: [{ $trim: { input: "$name" } }, providedHospital] }
        });
      }

      // 3. Case-insensitive match with trimmed database names
      if (!foundHospital) {
        foundHospital = await hospitals.findOne({
          $expr: {
            $eq: [
              { $toLower: { $trim: { input: "$name" } } },
              providedHospital.toLowerCase()
            ]
          }
        });
      }

      // Debug: Log all available hospitals if not found
      if (!foundHospital) {
        const allHospitals = await hospitals.find({}, { projection: { name: 1 } }).toArray();
        console.log("Available hospitals:", allHospitals.map(h => JSON.stringify(h.name)));
        return NextResponse.json(
          { error: "Selected hospital not found. Choose a registered hospital or select None." },
          { status: 400 }
        );
      }
      currentHospitalId = foundHospital._id as ObjectId;
      currentHospitalName = foundHospital.name.trim(); // Trim the stored name too
    }

    // Check if NMC number is already registered (compare normalized)
    const existingNMC = await doctors.findOne({ nmcRegistrationNumber: normalizedNmc });
    if (existingNMC) {
      return NextResponse.json(
        { error: "NMC registration number already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create doctor document - only include fields we explicitly want
    const doctor: any = {
      name,
      email,
      password: hashedPassword,
      nmcRegistrationNumber: normalizedNmc,
      registrationNumber: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique registration number
      department,
      qualification,
      medicalCollege,
      registrationYear: parsedRegistrationYear,
      phoneNumber,
      stateMedicalCouncil,
      address,
      experience: parseInt(experience),
      emergencyContact,
      dateOfBirth,
      gender,
      bloodGroup,
      role: "doctor",
      userType: UserType.DOCTOR,
      isVerified: false, // Will be verified by admin
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add hospital fields i f they have values
    if (currentHospitalName) {
      doctor.currentHospital = currentHospitalName;
    }
    if (currentHospitalId) {
      doctor.currentHospitalId = currentHospitalId;
    }

    // Debug: Log the doctor object before insertion
    console.log("Doctor object to insert:", JSON.stringify(doctor, null, 2));

    const result = await doctors.insertOne(doctor);

    // If a hospital was selected, add this doctor to hospital staff (idempotent add)
    if (currentHospitalId) {
      const staffMember = {
        type: UserType.DOCTOR,
        doctorId: result.insertedId,
        name,
        email,
        department,
        phone: phoneNumber,
      };
      await hospitals.updateOne(
        { _id: currentHospitalId },
        { $addToSet: { staff: staffMember } }
      );
    }

    return NextResponse.json(
      {
        message: "Doctor registered successfully. Please wait for verification.",
        doctorId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Doctor registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
