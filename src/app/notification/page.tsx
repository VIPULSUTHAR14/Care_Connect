"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SimpleNotification } from "@/types/simple-notification";
import { Bell, Send, Inbox, Loader2, CheckCircle2, XCircle } from "lucide-react";
// 1. FIX: Removed unused 'send' import from "process"

type Tab = "received" | "sent";

export default function NotificationPage() {
  const { status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("received");
  const [received, setReceived] = useState<SimpleNotification[]>([]);
  const [sent, setSent] = useState<SimpleNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchNotifications("received");
      void fetchNotifications("sent");
    }
    // eslint-disable-next-line
  }, [status]);

  const fetchNotifications = async (scope: Tab) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/notification?scope=${scope}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      
      const items: SimpleNotification[] = (data.notifications || []).map((n: any) => ({
        _id: String(n._id),
        senderId: String(n.senderId),
        senderName: String(n.senderName),
        receiverId: String(n.receiverId),
        receiverName: String(n.receiverName),
        type: String(n.type),
        createdAt: n.createdAt,
        isRead: Boolean(n.isRead),
        message: n.message || "",
      }));

      if (scope === "received") setReceived(items);
      else setSent(items);

    } catch (e: unknown) { // 2. FIX: Changed 'any' to 'unknown' for type safety
      // 3. FIX: Added a type guard to safely access the error message
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred while fetching notifications.");
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setReceived((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      }
    } catch {
      // Intentional: Fail silently on the UI for a better user experience
    }
  };

  const createTestNotification = async () => {
    try {
      const res = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: "self", receiverId: "self", type: "general", message: "Test notification message" }),
      });
      if (res.ok) {
        await fetchNotifications("received");
        await fetchNotifications("sent");
      }
    } catch (e: unknown) {
        if (e instanceof Error) {
            setError(`Failed to create test notification: ${e.message}`);
        } else {
            setError("An unknown error occurred while creating a test notification.");
        }
    }
  };

  const list = activeTab === "received" ? received : sent;

  return (
    <div className="min-h-[100vh] bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <div className="max-w-3xl mx-auto px-2 py-10 ">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="text-cyan-700" size={38} />
            <h1 className="text-4xl font-mono font-bold text-cyan-800 tracking-tight">My Notifications</h1>
          </div>
          <button
            onClick={createTestNotification}
            className="flex items-center gap-2 text-sm px-4 py-2 border border-cyan-700 rounded-xl text-cyan-700 hover:bg-cyan-50 font-mono font-semibold transition"
          >
            <Send size={18} /> Add Test
          </button>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex items-center gap-2 px-8 py-3 rounded-l-2xl border border-cyan-700 font-mono font-bold text-lg transition ${
              activeTab === "received"
                ? "bg-cyan-700 text-white shadow-lg"
                : "bg-white text-cyan-700 hover:bg-cyan-50"
            }`}
          >
            <Inbox size={22} /> Received
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-2 px-8 py-3 rounded-r-2xl border-t border-b border-r border-cyan-700 font-mono font-bold text-lg transition ${
              activeTab === "sent"
                ? "bg-cyan-700 text-white shadow-lg"
                : "bg-white text-cyan-700 hover:bg-cyan-50"
            }`}
          >
            <Send size={22} /> Sent
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 text-base bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-mono">
            <XCircle size={20} /> {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 flex items-center gap-2 text-cyan-700 text-base font-mono">
            <Loader2 className="animate-spin" size={20} /> Loading…
          </div>
        )}

        <ul className="space-y-6">
          {list.map((n) => (
            <li
              key={n._id}
              className={`flex flex-col md:flex-row md:items-center justify-between rounded-2xl shadow-md border-2 ${
                n.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-cyan-50 border-cyan-300"
              } px-6 py-5 transition`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold font-mono uppercase tracking-wide ${
                      n.isRead
                        ? "bg-gray-200 text-gray-600"
                        : "bg-cyan-700 text-white"
                    }`}
                  >
                    {n.type}
                  </span>
                  {n.isRead && (
                    <CheckCircle2 className="text-green-500" size={18} aria-label="Read" />
                  )}
                  <span className="text-xs text-gray-500 font-mono ml-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-mono text-base text-gray-800">
                    <span className="font-semibold text-cyan-800">From:</span>{" "}
                    <span className="text-cyan-700">{n.senderId}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="font-semibold text-cyan-800">To:</span>{" "}
                    <span className="text-cyan-700">{n.receiverId}</span>
                  </span>
                </div>
                <div className="bg-white border border-cyan-100 rounded-xl px-4 py-3 mt-2 font-mono text-cyan-900 text-base shadow-sm">
                  <span className="font-semibold text-cyan-700">Message:</span>{" "}
                  {n.message && n.message.trim() !== "" ? (
                    <span>{n.message}</span>
                  ) : (
                    <span className="italic text-gray-400">No message provided.</span>
                  )}
                </div>
              </div>
              {activeTab === "received" && !n.isRead && (
                <button
                  onClick={() => markAsRead(n._id!)}
                  className="mt-4 md:mt-0 md:ml-6 px-5 py-2 rounded-full bg-cyan-700 text-white text-base font-mono font-bold shadow hover:bg-cyan-800 transition"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
          {list.length === 0 && !loading && (
            <li className="text-center text-lg text-gray-400 py-12 font-mono">
              <span className="flex flex-col items-center gap-3">
                <Bell size={40} className="opacity-30" />
                No notifications to show.
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}