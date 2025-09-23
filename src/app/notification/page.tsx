  "use client"; 

  import { useEffect, useState } from "react";
  import { useSession } from "next-auth/react";
  import { useRouter } from "next/navigation";
  import { SimpleNotification } from "@/types/simple-notification";
  import { Bell, Send, Inbox, Loader2, CheckCircle2, XCircle } from "lucide-react";

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
          receiverId: String(n.receiverId),
          type: String(n.type),
          createdAt: n.createdAt,
          isRead: Boolean(n.isRead),
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
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Bell className="text-cyan-700" size={32} />
            <h1 className="text-3xl font-extrabold text-cyan-800 tracking-tight">Notifications</h1>
          </div>
          <button
            onClick={createTestNotification}
            className="flex items-center gap-1 text-xs px-3 py-1 border border-cyan-700 rounded-full text-cyan-700 hover:bg-cyan-50 transition"
          >
            <Send size={16} /> Add test
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex items-center gap-1 px-6 py-2 rounded-l-full border border-cyan-700 font-semibold transition ${
              activeTab === "received"
                ? "bg-cyan-700 text-white"
                : "bg-white text-cyan-700 hover:bg-cyan-50"
            }`}
          >
            <Inbox size={18} /> Received
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-1 px-6 py-2 rounded-r-full border-t border-b border-r border-cyan-700 font-semibold transition ${
              activeTab === "sent"
                ? "bg-cyan-700 text-white"
                : "bg-white text-cyan-700 hover:bg-cyan-50"
            }`}
          >
            <Send size={18} /> Sent
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            <XCircle size={18} /> {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 flex items-center gap-2 text-cyan-700 text-sm">
            <Loader2 className="animate-spin" size={18} /> Loading…
          </div>
        )}

        <ul className="space-y-4">
          {list.map((n) => (
            <li
              key={n._id}
              className={`flex items-center justify-between rounded-xl shadow-sm border ${
                n.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-cyan-50 border-cyan-200"
              } px-5 py-4 transition`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      n.isRead
                        ? "bg-gray-200 text-gray-600"
                        : "bg-cyan-700 text-white"
                    }`}
                  >
                    {n.type}
                  </span>
                  {n.isRead && (
                    <CheckCircle2 className="text-green-500" size={16} aria-label="Read" />
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-gray-700">
                  <span className="font-semibold">From:</span>{" "}
                  <span className="text-cyan-800">{n.senderId}</span>
                  <span className="mx-1">→</span>
                  <span className="font-semibold">To:</span>{" "}
                  <span className="text-cyan-800">{n.receiverId}</span>
                </div>
              </div>
              {activeTab === "received" && !n.isRead && (
                <button
                  onClick={() => markAsRead(n._id!)}
                  className="ml-4 px-3 py-1 rounded-full bg-cyan-700 text-white text-xs font-semibold shadow hover:bg-cyan-800 transition"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
          {list.length === 0 && !loading && (
            <li className="text-center text-sm text-gray-400 py-8">
              <span className="flex flex-col items-center gap-2">
                <Bell size={32} className="opacity-30" />
                No notifications.
              </span>
            </li>
          )}
        </ul>
      </div>
    );
  }
