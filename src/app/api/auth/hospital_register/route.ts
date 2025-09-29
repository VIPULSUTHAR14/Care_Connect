import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/ConnectDB"; // Use shared DB helper
import bcrypt from "bcryptjs";

// POST /api/auth/hospital_register
export async function POST(request: NextRequest) {
  try {
    // Parse form data (for file uploads, use formData)
    const formData = await request.formData();

    const hospitalName = formData.get("hospitalName");
    const registerNumber = formData.get("registerNumber");
    const registrationCertificate = formData.get("registrationCertificate"); // File
    const premisesImages = formData.getAll("premisesImages"); // Array of Files
    const location = formData.get("location"); // String (could be JSON stringified)
    const adminEmail = formData.get("adminEmail");
    const password = formData.get("password");

    // Validation
    if (
      !hospitalName ||
      !registerNumber ||
      !registrationCertificate ||
      !premisesImages ||
      premisesImages.length < 3 ||
      premisesImages.length > 5 ||
      !location ||
      !adminEmail ||
      !password
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Get the hospital collection
    const db = await getDatabase();
    const collection = db.collection("hospitals");

    // Check if hospital already exists by admin email or register number
    const existing = await collection.findOne({
      $or: [{ adminEmail }, { registerNumber }],
    });
    if (existing) {
      return NextResponse.json(
        { error: "Hospital with this email or register number already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password as string, 12);

    // Handle file uploads (for demo, store as base64; in production, use cloud storage)
    // Registration certificate
    let registrationCertificateData = null;
    if (registrationCertificate instanceof File) {
      const buffer = Buffer.from(await registrationCertificate.arrayBuffer());
      registrationCertificateData = {
        name: registrationCertificate.name,
        type: registrationCertificate.type,
        data: buffer.toString("base64"),
      };
    }

    // Premises images
    const premisesImagesData = [];
    for (const img of premisesImages) {
      if (img instanceof File) {
        const buffer = Buffer.from(await img.arrayBuffer());
        premisesImagesData.push({
          name: img.name,
          type: img.type,
          data: buffer.toString("base64"),
        });
      }
    }

    // Parse location if it's a JSON string
    let locationObj = location;
    try {
      locationObj = JSON.parse(location as string);
    } catch {
      // If not JSON, keep as string
    }

    // Prepare hospital data
    const hospitalData = {
      hospitalName,
      registerNumber,
      registrationCertificate: registrationCertificateData,
      premisesImages: premisesImagesData,
      location: locationObj,
      adminEmail,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // Insert into collection
    const result = await collection.insertOne(hospitalData);

    if (result.insertedId) {
      // Remove password from response
      const { password: _, ...hospitalWithoutPassword } = hospitalData;
      return NextResponse.json({
        message: "Hospital registered successfully",
        hospital: {
          ...hospitalWithoutPassword,
          _id: result.insertedId,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Failed to register hospital" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: (error as unknown as Error).message },
      { status: 500 }
    );
  }
}
