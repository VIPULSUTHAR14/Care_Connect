import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDatabase } from "@/lib/ConnectDB";
import { ObjectId } from "mongodb";

// Collection name per requirement: "notification" (singular)
const COLLECTION_NAME = "notification";

// Helper to get user name by id
async function getUserNameById(db: any, userId: ObjectId) {
  const user = await db.collection("users").findOne({ _id: userId }, { projection: { name: 1 } });
  return user?.name || null;
}

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
    const collection = db.collection(COLLECTION_NAME);

    // Allow "self" as a placeholder meaning the current user
    const resolvedSenderId = senderId === "self" ? session.user.id : senderId;
    const resolvedReceiverId = receiverId === "self" ? session.user.id : receiverId;

    if (!ObjectId.isValid(resolvedSenderId) || !ObjectId.isValid(resolvedReceiverId)) {
      return NextResponse.json(
        { error: "Invalid senderId or receiverId" },
        { status: 400 }
      );
    }

    const senderObjectId = new ObjectId(resolvedSenderId);
    const receiverObjectId = new ObjectId(resolvedReceiverId);

    // Fetch sender and receiver names
    const [senderName, receiverName] = await Promise.all([
      getUserNameById(db, senderObjectId),
      getUserNameById(db, receiverObjectId),
    ]);

    const doc = {
      senderId: senderObjectId,
      senderName: senderName,
      receiverId: receiverObjectId,
      receiverName: receiverName,
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

    // Collect all unique sender and receiver IDs to batch fetch names
    const userIdsSet = new Set<string>();
    items.forEach((n) => {
      if (n.senderId) userIdsSet.add(n.senderId.toString());
      if (n.receiverId) userIdsSet.add(n.receiverId.toString());
    });
    const userIds = Array.from(userIdsSet).map((id) => new ObjectId(id));
    let userMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const users = await db
        .collection("users")
        .find({ _id: { $in: userIds } }, { projection: { name: 1 } })
        .toArray();
      userMap = users.reduce((acc: Record<string, string>, user: any) => {
        acc[user._id.toString()] = user.name || null;
        return acc;
      }, {});
    }

    return NextResponse.json({
      scope,
      page,
      limit,
      total,
      notifications: items.map((n) => ({
        _id: n._id,
        senderId: n.senderId,
        senderName: userMap[n.senderId?.toString()] || null,
        receiverId: n.receiverId,
        receiverName: userMap[n.receiverId?.toString()] || null,
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
    const collection = db.collection(COLLECTION_NAME);

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

