export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'medication' | 'report' | 'reminder' | 'general';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  metadata?: {
    appointmentId?: string;
    medicationId?: string;
    reportId?: string;
    [key: string]: any;
  };
}

export interface NotificationResponse {
  notifications: Notification[];
}
