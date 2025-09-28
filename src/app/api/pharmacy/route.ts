import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/ConnectDB";

// GET /api/pharmacy
// Query params:
// - page, limit for pharmacies list
// - medicines=available|all → when present, returns a flattened medicine list across pharmacies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const medicinesMode = searchParams.get("medicines"); // undefined | 'available' | 'all'
    const pharmacyId = searchParams.get("pharmacyId");

    const db = await getDatabase();
    const pharmacyCollection = db.collection("pharmacy");

    // If asking for medicines, aggregate and return
    if (medicinesMode) {
      const matchAvailable = medicinesMode === "Available";

      // If a specific pharmacy is requested, return medicines EXACTLY as stored for that pharmacy
      if (pharmacyId) {
        try {
          const { ObjectId } = await import("mongodb");
          const id = new ObjectId(pharmacyId);

          // Use $filter to keep original structure
          const docs = await pharmacyCollection
            .aggregate([
              { $match: { _id: id } },
              {
                $project: {
                  // Support both nested at pharmacy.medicines and top-level medicines
                  medicines: matchAvailable
                    ? {
                        $filter: {
                          input: { $ifNull: ["$pharmacy.medicines", "$medicines"] },
                          as: "m",
                          cond: { $regexMatch: { input: { $ifNull: ["$$m.stock", ""] }, regex: /^available$/i } },
                        },
                      }
                    : { $ifNull: ["$pharmacy.medicines", "$medicines"] },
                },
              },
            ])
            .toArray();

          const medicines = docs[0]?.medicines || [];
          return NextResponse.json({ medicines, filter: matchAvailable ? "available" : "all", pharmacyId });
        } catch (_) {
          return NextResponse.json({ error: "Invalid pharmacyId" }, { status: 400 });
        }
      }

      // Otherwise, return a flattened, paginated list across all pharmacies
      const pipeline: any[] = [
        {
          $project: {
            medicines: { $ifNull: ["$pharmacy.medicines", "$medicines"] },
            name: 1,
            email: 1,
            location: "$pharmacy.location",
            phoneNumber: "$pharmacy.phoneNumber",
          },
        },
        { $unwind: "$medicines" },
      ];

      if (matchAvailable) {
        pipeline.push({ $match: { "medicines.stock": { $regex: /^available$/i } } });
      }

      pipeline.push(
        { $sort: { "medicines.medicine_name": 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      );

      const [items, totalDocs] = await Promise.all([
        pharmacyCollection.aggregate(pipeline).toArray(),
        pharmacyCollection
          .aggregate([
            { $project: { medicines: { $ifNull: ["$pharmacy.medicines", "$medicines"] } } },
            { $unwind: "$medicines" },
            ...(matchAvailable ? [{ $match: { "medicines.stock": { $regex: /^available$/i } } }] : []),
            { $count: "count" },
          ])
          .toArray(),
      ]);

      const total = totalDocs[0]?.count || 0;

      return NextResponse.json({
        medicines: items.map((doc: any) => ({ ...doc.medicines })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        filter: matchAvailable ? "available" : "all",
      });
    }

    // Default: list pharmacies (basic projection, hide passwords)
    const total = await pharmacyCollection.countDocuments();
    const pharmacies = await pharmacyCollection
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      pharmacies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching pharmacy data:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharmacy data" },
      { status: 500 }
    );
  }
}


