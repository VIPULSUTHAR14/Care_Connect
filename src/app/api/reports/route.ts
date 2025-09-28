import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDatabase } from "@/lib/ConnectDB";
import { ObjectId } from "mongodb";

const REPORTS_COLLECTION = "reports";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const reportId = searchParams.get("reportId");
    
    // If requesting a specific report
    if (reportId) {
      if (!ObjectId.isValid(reportId)) {
        return NextResponse.json(
          { message: "Invalid report ID" },
          { status: 400 }
        );
      }

      const db = await getDatabase();
      const collection = db.collection(REPORTS_COLLECTION);
      
      const report = await collection.findOne({ _id: new ObjectId(reportId) });
      
      if (!report) {
        return NextResponse.json(
          { message: "Report not found" },
          { status: 404 }
        );
      }

      // Security check: ensure user can only access their own reports
      const reportPatientId = typeof report.patientId === 'string' ? report.patientId : report.patientId?.toString();
      if (reportPatientId !== session.user.id && session.user.userType !== 'hospital') {
        return NextResponse.json(
          { message: "Access denied" },
          { status: 403 }
        );
      }

      const formattedReport = formatSingleReport(report);
      return NextResponse.json({ report: formattedReport });
    }

    // For patient list requests, validate patientId
    if (!patientId || !ObjectId.isValid(patientId)) {
      return NextResponse.json(
        { message: "Invalid or missing patient ID" },
        { status: 400 }
      );
    }

    // Security check: patients can only access their own reports
    if (session.user.userType === 'patient' && session.user.id !== patientId) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const db = await getDatabase();
    const collection = db.collection(REPORTS_COLLECTION);

    // DEBUG: Enhanced logging for troubleshooting
    console.log("=== ENHANCED DEBUG INFO ===");
    console.log("Searching for patientId:", patientId);
    console.log("Session user ID:", session.user.id);
    console.log("Session user role:", session.user.userType);
    console.log("PatientId type:", typeof patientId);
    console.log("Is ObjectId valid:", ObjectId.isValid(patientId));

    // Check total documents in collection
    const totalDocs = await collection.countDocuments({});
    console.log("Total documents in reports collection:", totalDocs);

    if (totalDocs > 0) {
      // Get sample documents to understand data structure
      const sampleDocs = await collection.find({}).limit(3).toArray();
      console.log("Sample documents count:", sampleDocs.length);
      
      sampleDocs.forEach((doc, index) => {
        console.log(`Sample doc ${index + 1}:`, {
          _id: doc._id,
          patientId: doc.patientId,
          patientIdType: typeof doc.patientId,
          hasPatientInfo: !!doc.patient,
          hasSymptoms: !!doc.symptoms,
          hasPrescriptionArray: Array.isArray(doc.prescription),
          hasFollowUp: !!doc.followUpDate
        });
      });
    }

    // Try different query approaches for patientId matching
    const queries = [
      { patientId: patientId }, // String match
      { patientId: new ObjectId(patientId) }, // ObjectId match
      { "patient.id": patientId }, // Nested patient ID
      { "patient._id": new ObjectId(patientId) } // Nested patient ObjectId
    ];

    let matchQuery = null;
    let total = 0;

    // Test each query approach
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const count = await collection.countDocuments(query);
      console.log(`Query ${i + 1} (${JSON.stringify(query)}): ${count} results`);
      
      if (count > 0 && !matchQuery) {
        matchQuery = query;
        total = count;
        console.log(`Using query approach ${i + 1}`);
        break;
      }
    }

    if (!matchQuery || total === 0) {
      console.log("No reports found with any query approach");
      return NextResponse.json(
        { 
          message: "No reports found for this patient",
          debug: {
            patientId,
            totalDocsInCollection: totalDocs,
            queriesAttempted: queries.length,
            sessionUserId: session.user.id,
            userRole: session.user.userType
          }
        },
        { status: 404 }
      );
    }

    // Fetch the actual documents
    const reportsFromDb = await collection
      .find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log("Found reports:", reportsFromDb.length);
    console.log("=== END ENHANCED DEBUG ===");

    // Format reports with enhanced structure
    const reports = reportsFromDb.map(formatSingleReport);

    return NextResponse.json({
      page,
      limit,
      total,
      reports,
      pagination: {
        hasNextPage: (page * limit) < total,
        hasPrevPage: page > 1,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error : any) {
    console.error("Error fetching patient reports:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch reports due to an internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to format a single report document
function formatSingleReport(r: any) {
  return {
    _id: r._id?.toString?.() ?? "",
    appointmentId: r.appointmentId ? String(r.appointmentId) : "",
    patientId: r.patientId ? String(r.patientId) : "",
    hospitalId: r.hospitalId ? String(r.hospitalId) : "",
    
    // Enhanced patient information
    patient: r.patient ? {
      name: r.patient.name || "",
      age: r.patient.age || 0,
      gender: r.patient.gender || ""
    } : {
      name: "",
      age: 0,
      gender: ""
    },
    
    // Symptoms array
    symptoms: Array.isArray(r.symptoms) ? r.symptoms : [],
    
    // Clinical information
    diagnosis: r.diagnosis ?? "",
    treatment: r.treatment ?? "",
    
    // Enhanced prescription structure
    prescription: Array.isArray(r.prescription) 
      ? r.prescription.map((med: any) => ({
          medicine: med.medicine || med.name || "",
          dosage: med.dosage || "",
          frequency: med.frequency || "",
          timing: Array.isArray(med.timing) ? med.timing : [],
          duration: med.duration || "",
          instructions: med.instructions || ""
        }))
      : typeof r.prescription === 'string' 
        ? [{ 
            medicine: "Legacy Prescription",
            dosage: "",
            frequency: "",
            timing: [],
            duration: "",
            instructions: r.prescription
          }]
        : [],
    
    // Follow-up and notes
    notes: r.notes ?? "",
    followUpDate: r.followUpDate ? String(r.followUpDate) : "",
    followUpInstructions: r.followUpInstructions ?? "",
    
    // Timestamps
    completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : "",
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : "",
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : ""
  };
}

// Additional helper function to get report statistics (optional endpoint)
export async function HEAD(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    
    if (!patientId || !ObjectId.isValid(patientId)) {
      return new NextResponse(null, { status: 400 });
    }

    // Security check
    if (session.user.userType === 'patient' && session.user.id !== patientId) {
      return new NextResponse(null, { status: 403 });
    }

    const db = await getDatabase();
    const collection = db.collection(REPORTS_COLLECTION);

    // Try different query approaches
    const queries = [
      { patientId: patientId },
      { patientId: new ObjectId(patientId) }
    ];

    let total = 0;
    for (const query of queries) {
      total = await collection.countDocuments(query);
      if (total > 0) break;
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Total-Count': total.toString(),
        'X-Patient-ID': patientId
      }
    });
  } catch (error) {
    console.error("Error getting report stats:", error);
    return new NextResponse(null, { status: 500 });
  }
}