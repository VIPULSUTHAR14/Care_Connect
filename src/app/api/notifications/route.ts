import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDatabase } from "@/lib/ConnectDB";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const notificationsCollection = db.collection("notifications");

    // Fetch notifications for the current user
    const notifications = await notificationsCollection
      .find({ 
        userId: new ObjectId(session.user.id),
        isRead: false 
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await request.json();
    
    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    const db = await getDatabase();
    const notificationsCollection = db.collection("notifications");

    // Mark notification as read
    const result = await notificationsCollection.updateOne(
      { 
        _id: new ObjectId(notificationId),
        userId: new ObjectId(session.user.id)
      },
      { $set: { isRead: true, readAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
