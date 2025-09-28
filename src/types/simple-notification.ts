export type SimpleNotificationType = string;

export interface SimpleNotification {
  _id?: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  receiverName?: string;
  type: SimpleNotificationType;
  createdAt: Date | string;
  isRead: boolean;
  message?: string; // optional message content
}


