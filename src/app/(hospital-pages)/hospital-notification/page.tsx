"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Send, Inbox, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSocketContext } from "@/app/contexts/SocketContext";
import { toast } from "react-toastify";

// Extend the notification type to include message
type NotificationWithMessage = {
  _id: string;
  senderId: string;
  receiverId: string;
  type: string;
  createdAt: string;
  isRead: boolean;
  message?: string;
};

type Tab = "received" | "sent";

export default function NotificationPage() {
  const { status } = useSession();
  const router = useRouter();
  const { sendPatientNotification } = useSocketContext();

  const [activeTab, setActiveTab] = useState<Tab>("received");
  const [received, setReceived] = useState<NotificationWithMessage[]>([]);
  const [sent, setSent] = useState<NotificationWithMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

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
      const res = await fetch(`/api/hospital-api/notification?scope=${scope}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      const items: NotificationWithMessage[] = (data.notifications || []).map((n: any) => ({
        _id: String(n._id),
        senderId: String(n.senderId),
        receiverId: String(n.receiverId),
        type: String(n.type),
        createdAt: n.createdAt,
        isRead: Boolean(n.isRead),
        message: n.message ? String(n.message) : undefined,
      }));
      if (scope === "received") setReceived(items);
      else setSent(items);
    } catch (e: any) {
      setError(e?.message || "Error fetching notifications");
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
      // no-op
    }
  };

  const acceptNotification = async (n: NotificationWithMessage) => {
    try {
      // 1) Persist appointment with pending status
      try {
        await fetch("/api/doctor-api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: n.senderId,
            hospitalId: n.receiverId,
            sourceNotificationId: n._id,
          }),
        });
      } catch { }

      // 2) Send real-time confirmation to patient
      if (n.senderId) {
        sendPatientNotification({
          patientId: n.senderId,
          message: "Your appointment is booked",
          type: "appointment",
        });
      }

      // 3) Mark notification as read locally and on server
      await markAsRead(n._id);

      // 4) Navigate to hospital appointments page
      router.push("/appointments");
    } catch {
      // no-op (could add toast)
    }
  };

  const sendResponseToPatient = async (n: NotificationWithMessage) => {
    const reply = (replyMap[n._id] || "").trim();
    if (!reply) {
      toast.warn("Please type a response message");
      return;
    }
    try {
      // Real-time reply to patient
      if (n.senderId) {
        sendPatientNotification({
          patientId: n.senderId,
          message: reply,
          type: "appointment",
        });
      }

      // Persist reply as a new notification (hospital -> patient)
      await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: n.receiverId, // hospital id
          receiverId: n.senderId, // patient id
          type: "appointment",
          message: reply,
        }),
      });

      toast.success("Response sent to patient");
      setReplyMap((prev) => ({ ...prev, [n._id]: "" }));

      // Refresh sent list silently
      void fetchNotifications("sent");
    } catch (e: any) {
      toast.error(e?.message || "Failed to send response");
    }
  };

  const createTestNotification = async () => {
    try {
      const res = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: "self", receiverId: "self", type: "general", message: "Test" }),
      });
      if (res.ok) {
        await fetchNotifications("received");
        await fetchNotifications("sent");
      }
    } catch {
      // ignore
    }
  };

  const list = activeTab === "received" ? received : sent;

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-2">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="bg-cyan-100 rounded-full p-2 shadow">
              <Bell className="text-cyan-700" size={32} />
            </span>
            <h1 className="text-3xl font-extrabold text-cyan-800 tracking-tight drop-shadow-sm">Notifications</h1>
          </div>
          <button
            onClick={createTestNotification}
            className="flex items-center gap-1 text-xs px-3 py-1 border border-cyan-700 rounded-full text-cyan-700 bg-white hover:bg-cyan-50 transition shadow"
          >
            <Send size={16} /> Add test
          </button>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full shadow overflow-hidden border border-cyan-700 bg-white">
            <button
              onClick={() => setActiveTab("received")}
              className={`flex items-center gap-1 px-6 py-2 font-semibold transition focus:outline-none ${activeTab === "received"
                ? "bg-cyan-700 text-white"
                : "text-cyan-700 hover:bg-cyan-50"
                }`}
            >
              <Inbox size={18} /> Received
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`flex items-center gap-1 px-6 py-2 font-semibold transition focus:outline-none ${activeTab === "sent"
                ? "bg-cyan-700 text-white"
                : "text-cyan-700 hover:bg-cyan-50"
                }`}
            >
              <Send size={18} /> Sent
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2 shadow">
            <XCircle size={18} /> {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 flex items-center gap-2 text-cyan-700 text-sm">
            <Loader2 className="animate-spin" size={18} /> Loading…
          </div>
        )}

        <ul className="space-y-6">
          {list.map((n) => (
            <li
              key={n._id}
              className={`flex flex-col md:flex-row md:items-center justify-between rounded-2xl shadow-lg border ${n.isRead
                ? "bg-white border-gray-200"
                : "bg-cyan-50 border-cyan-200"
                } px-6 py-5 transition`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow ${n.isRead
                      ? "bg-gray-200 text-gray-600"
                      : "bg-cyan-700 text-white"
                      }`}
                  >
                    {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                  </span>
                  {n.isRead && (
                    <CheckCircle2 className="text-green-500" size={16} aria-label="Read" />
                  )}
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700 mb-1">
                  <span className="font-semibold">From:</span>
                  <span className="text-cyan-800 break-all">{n.senderId}</span>
                  <span className="mx-1 text-gray-400">→</span>
                  <span className="font-semibold">To:</span>
                  <span className="text-cyan-800 break-all">{n.receiverId}</span>
                </div>
                {n.message && (
                  <div className="text-sm text-gray-900 mt-2 bg-gray-100 rounded px-3 py-2 border border-gray-200">
                    <span className="font-semibold">Message:</span>{" "}
                    <span>{n.message}</span>
                  </div>
                )}
                {activeTab === "received" && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      value={replyMap[n._id] || ""}
                      onChange={(e) => setReplyMap((prev) => ({ ...prev, [n._id]: e.target.value }))}
                      placeholder="Type response to patient"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-white shadow"
                    />
                    <button
                      onClick={() => sendResponseToPatient(n)}
                      className="px-4 py-2 rounded-md bg-cyan-700 text-white text-xs font-semibold shadow hover:bg-cyan-800 transition flex items-center gap-1 w-full sm:w-auto"
                    >
                      <Send size={14} /> Send
                    </button>
                  </div>
                )}
              </div>
              {activeTab === "received" && (
                <div className="flex flex-row md:flex-col items-center gap-2 ml-0 md:ml-6 mt-4 md:mt-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id!)}
                      className="px-4 py-2 rounded-full bg-cyan-700 text-white text-xs font-semibold shadow hover:bg-cyan-800 transition w-full md:w-auto"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => acceptNotification(n)}
                    className="px-4 py-2 rounded-full bg-green-600 text-white text-xs font-semibold shadow hover:bg-green-700 transition w-full md:w-auto"
                  >
                    Accept
                  </button>
                </div>
              )}
            </li>
          ))}
          {list.length === 0 && !loading && (
            <li className="text-center text-sm text-gray-400 py-12">
              <span className="flex flex-col items-center gap-3">
                <Bell size={40} className="opacity-30" />
                No notifications.
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
