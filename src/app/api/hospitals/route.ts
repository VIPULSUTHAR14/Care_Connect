// Yes, this route is fetching hospital data.

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/ConnectDB";
import { Filter, Document } from "mongodb"; // 1. Import specific types from mongodb

// GET: Fetch hospital data (with optional search, city filter, and pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';

    const db = await getDatabase();
    // 4. CONSISTENCY FIX: Changed "Hospital" to "hospital" to match your POST route
    const hospitalsCollection = db.collection("hospital"); 

    // 2. FIX: Changed `let` to `const` and `any` to `Filter<Document>`
    const query: Filter<Document> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { 'staff.speciality': { $regex: search, $options: 'i' } }
      ];
    }
    if (city) {
      // To avoid conflicts, merge this with the existing address query if needed
      query.address = { $regex: city, $options: 'i' };
    }

    const total = await hospitalsCollection.countDocuments(query);

    const hospitals = await hospitalsCollection
      .find(query, { projection: { password: 0 } })
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      hospitals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: unknown) { // 3. BONUS FIX: Use 'unknown' for type-safe errors
    console.error("Error fetching hospitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}

// POST: Create a new hospital entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const hospitalsCollection = db.collection("hospital");

    const requiredFields = [
      'name',
      'address',
      'reception_number',
      'ambulance_number',
      'nha_registration_number',
      'email'
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const existingHospital = await hospitalsCollection.findOne({
      $or: [
        { email: body.email },
        { nha_registration_number: body.nha_registration_number }
      ]
    });

    if (existingHospital) {
      return NextResponse.json(
        { error: "Hospital with this email or registration number already exists" },
        { status: 409 }
      );
    }

    const newHospital = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await hospitalsCollection.insertOne(newHospital);

    return NextResponse.json({
      success: true,
      hospitalId: result.insertedId,
      message: "Hospital created successfully"
    }, { status: 201 });
  } catch (error: unknown) { // 3. BONUS FIX: Use 'unknown'
    console.error("Error creating hospital:", error);
    return NextResponse.json(
      { error: "Failed to create hospital" },
      { status: 500 }
    );
  }
}