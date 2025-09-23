"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Notification } from "@/types/notification";
import { 
  Bell, 
  Calendar, 
  Pill, 
  FileText, 
  Clock, 
  Info,
  Check,
  X,
  ArrowLeft
} from "lucide-react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment':
      return <Calendar className="w-5 h-5" />;
    case 'medication':
      return <Pill className="w-5 h-5" />;
    case 'report':
      return <FileText className="w-5 h-5" />;
    case 'reminder':
      return <Clock className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

const getNotificationColor = (type: string, priority: string) => {
  if (priority === 'high') {
    return 'bg-red-50 border-red-200 text-red-800';
  }
  if (priority === 'medium') {
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  }
  
  switch (type) {
    case 'appointment':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'medication':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'report':
      return 'bg-purple-50 border-purple-200 text-purple-800';
    case 'reminder':
      return 'bg-orange-50 border-orange-200 text-orange-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-cyan-800" />
                <h1 className="text-2xl font-mono font-bold text-cyan-800">
                  Notifications
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {notifications.length} unread
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {notifications.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg border-2 p-6 shadow-sm hover:shadow-md transition-shadow ${
                  notification.isRead 
                    ? 'border-gray-200 bg-gray-50' 
                    : 'border-cyan-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          notification.isRead ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        {notification.priority === 'high' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mb-3 ${
                        notification.isRead ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatDate(notification.createdAt)}
                        </span>
                        {notification.actionUrl && (
                          <button
                            onClick={() => router.push(notification.actionUrl!)}
                            className="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
                          >
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="ml-4 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
