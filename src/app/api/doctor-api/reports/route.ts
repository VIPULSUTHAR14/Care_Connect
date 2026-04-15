    import { NextRequest, NextResponse } from "next/server";
    import { getDatabase } from "@/lib/db";
    import { ObjectId } from "mongodb";

    // Type for prescription medicine
    type PrescriptionMed = {
    medicine?: string;
    name?: string;
    dosage?: string;
    frequency?: string;
    timing?: string[];
    duration?: string;
    instructions?: string;
    };

    export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
        appointmentId,
        patientId,
        hospitalId,
        // Patient Information
        patient,
        // Clinical Information
        symptoms,
        diagnosis,
        treatment,
        // Prescription with detailed structure
        prescription,
        // Follow-up and Notes
        notes,
        followUpDate,
        followUpInstructions,
        completedAt,
        } = body;

        // Validate required fields
        if (!patientId || !hospitalId || !diagnosis || !treatment) {
        return NextResponse.json(
            { error: "Missing required fields: patientId, hospitalId, diagnosis, treatment" },
            { status: 400 }
        );
        }

        // Validate patient information
        if (!patient || !patient.name || !patient.age || !patient.gender) {
        return NextResponse.json(
            { error: "Missing required patient information: name, age, gender" },
            { status: 400 }
        );
        }

        const db = await getDatabase();
        const reports = db.collection("reports");

        // Create enhanced report structure
        const report = {
        appointmentId: appointmentId || null,
        patientId,
        hospitalId,

        // Patient Information
        patient: {
            name: patient.name,
            age: parseInt(patient.age),
            gender: patient.gender
        },

        // Clinical Information
        symptoms: symptoms || [],
        diagnosis,
        treatment,

        // Enhanced Prescription Structure
        prescription: Array.isArray(prescription)
            ? (prescription as PrescriptionMed[]).map((med) => ({
                medicine: med.medicine || med.name,
                dosage: med.dosage || "",
                frequency: med.frequency || "",
                timing: Array.isArray(med.timing) ? med.timing : [],
                duration: med.duration || "",
                instructions: med.instructions || ""
            }))
            : [],

        // Follow-up and Notes
        notes: notes || "",
        followUpDate: followUpDate || null,
        followUpInstructions: followUpInstructions || "",

        // Metadata
        completedAt: completedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        };

        const result = await reports.insertOne(report);

        // Update patient's pastReports array
        try {
        const patients = db.collection("patients");
        const patientObjectId =
            typeof patientId === "string" ? new ObjectId(patientId) : patientId;

        await patients.updateOne(
            { _id: patientObjectId },
            { $push: { pastReports: result.insertedId.toString() } as any } // Fixed: Remove array wrapper
        );
        } catch (updateError) {
        console.warn("Warning: Could not update patient pastReports:", updateError);
        // Continue execution even if patient update fails
        }

        return NextResponse.json(
        {
            message: "Report created successfully",
            reportId: result.insertedId,
            report: {
            ...report,
            _id: result.insertedId
            }
        },
        { status: 201 }
        );
    } catch (error) {
        console.error("Report creation error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
        { error: "Internal server error", details: message },
        { status: 500 }
        );
    }
    }

    export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get("patientId") ?? undefined;
        const hospitalId = searchParams.get("hospitalId") ?? undefined;
        const reportId = searchParams.get("reportId") ?? undefined;
        const limitParam = searchParams.get("limit");
        const skipParam = searchParams.get("skip");
        const limit = limitParam ? parseInt(limitParam) : 100;
        const skip = skipParam ? parseInt(skipParam) : 0;

        const db = await getDatabase();
        const reports = db.collection("reports");

        // Build filter object
        const filter: Record<string, any> = {};
        if (patientId) filter.patientId = patientId;
        if (hospitalId) filter.hospitalId = hospitalId;
        if (reportId) filter._id = new ObjectId(reportId);

        // If requesting a specific report
        if (reportId) {
        const report = await reports.findOne(filter);
        if (!report) {
            return NextResponse.json(
            { error: "Report not found" },
            { status: 404 }
            );
        }
        return NextResponse.json({ report });
        }

        // Get multiple reports with pagination
        const totalReports = await reports.countDocuments(filter);
        const reportsList = await reports
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

        return NextResponse.json({
        reports: reportsList,
        pagination: {
            total: totalReports,
            limit,
            skip,
            hasMore: skip + limit < totalReports
        }
        });
    } catch (error) {
        console.error("Report fetch error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
        { error: "Internal server error", details: message },
        { status: 500 }
        );
    }
    }

    export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { reportId, ...updateData } = body;

        if (!reportId) {
        return NextResponse.json(
            { error: "Missing reportId" },
            { status: 400 }
        );
        }

        const db = await getDatabase();
        const reports = db.collection("reports");

        // Update the report
        const result = await reports.updateOne(
        { _id: new ObjectId(reportId) },
        {
            $set: {
            ...updateData,
            updatedAt: new Date().toISOString()
            }
        }
        );

        if (result.matchedCount === 0) {
        return NextResponse.json(
            { error: "Report not found" },
            { status: 404 }
        );
        }

        return NextResponse.json({
        message: "Report updated successfully",
        modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Report update error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
        { error: "Internal server error", details: message },
        { status: 500 }
        );
    }
    }

    export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const reportId = searchParams.get("reportId");

        if (!reportId) {
        return NextResponse.json(
            { error: "Missing reportId" },
            { status: 400 }
        );
        }

        const db = await getDatabase();
        const reports = db.collection("reports");

        // Get the report first to get patientId
        const report = await reports.findOne({ _id: new ObjectId(reportId) });
        if (!report) {
        return NextResponse.json(
            { error: "Report not found" },
            { status: 404 }
        );
        }

        // Delete the report
        await reports.deleteOne({ _id: new ObjectId(reportId) });

        // Remove from patient's pastReports array
        try {
        const patients = db.collection("patients");
        const patientObjectId =
            typeof report.patientId === "string"
            ? new ObjectId(report.patientId)
            : report.patientId;

        await patients.updateOne(
            { _id: patientObjectId },
            { $pull: { pastReports: reportId } as any } // Fixed: Remove array wrapper
        );
        } catch (updateError) {
        console.warn("Warning: Could not update patient pastReports:", updateError);
        }

        return NextResponse.json({
        message: "Report deleted successfully"
        });
    } catch (error) {
        console.error("Report deletion error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
        { error: "Internal server error", details: message },
        { status: 500 }
        );
    }
    }