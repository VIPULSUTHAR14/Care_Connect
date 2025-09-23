export type SimpleNotificationType = string;

export interface SimpleNotification {
  _id?: string;
  senderId: string;
  receiverId: string;
  type: SimpleNotificationType;
  createdAt: Date | string;
  isRead: boolean;
}


