    import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDatabase } from "@/lib/ConnectDB";
import { ObjectId } from "mongodb";

// Collection name per requirement: "notification" (singular)
const COLLECTION_NAME = "notification";

// POST: Create/send a notification
// Body: { senderId, receiverId, type, message? }
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { senderId, receiverId, type, message } = await request.json();

    if (!senderId || !receiverId || !type) {
      return NextResponse.json(
        { error: "senderId, receiverId and type are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("notification");

    // Allow "self" as a placeholder meaning the current user
    const resolvedSenderId = senderId === "self" ? session.user.id : senderId;
    const resolvedReceiverId = receiverId === "self" ? session.user.id : receiverId;

    if (!ObjectId.isValid(resolvedSenderId) || !ObjectId.isValid(resolvedReceiverId)) {
      return NextResponse.json(
        { error: "Invalid senderId or receiverId" },
        { status: 400 }
      );
    }

    const doc = {
      senderId: new ObjectId(resolvedSenderId),
      receiverId: new ObjectId(resolvedReceiverId),
      type: String(type),
      message: message ? String(message) : undefined,
      createdAt: new Date(),
      isRead: false,
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json({
      success: true,
      notification: { ...doc, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// GET: Fetch notifications
// Query params:
// - scope=received | sent (default: received)
// - page, limit (optional pagination)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = (searchParams.get("scope") || "received").toLowerCase();
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const userObjectId = new ObjectId(session.user.id);

    const match =
      scope === "sent"
        ? { senderId: userObjectId }
        : { receiverId: userObjectId };

    const [total, items] = await Promise.all([
      collection.countDocuments(match),
      collection
        .find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    return NextResponse.json({
      scope,
      page,
      limit,
      total,
      notifications: items.map((n) => ({
        _id: n._id,
        senderId: n.senderId,
        receiverId: n.receiverId,
        type: n.type,
        message: n.message,
        createdAt: n.createdAt,
        isRead: n.isRead,
      })),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PUT: Update a notification message (sender-only)
// Body: { notificationId, message }
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId, message } = await request.json();
    if (!notificationId || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "notificationId and non-empty message are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("notification");

    // Only the sender can update the message
    const filter = { _id: new ObjectId(notificationId), senderId: new ObjectId(session.user.id) };
    const update = { $set: { message: String(message) } };
    const result = await collection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notification not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification message:", error);
    return NextResponse.json(
      { error: "Failed to update notification message" },
      { status: 500 }
    );
  }
}

// PATCH: Mark a notification as read
// Body: { notificationId }
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();
    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.updateOne(
      { _id: new ObjectId(notificationId), receiverId: new ObjectId(session.user.id) },
      { $set: { isRead: true, readAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}


