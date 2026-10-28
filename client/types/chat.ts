export enum SenderRole {
  NORMAL = "normal",
  VIP = "vip",
  ADMIN = "admin",
}

export enum MessageStatus {
  SENT = "SENT",
  READ = "READ",
}

export interface Message {
  _id: string;
  chatRoomId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  _id: string; // This corresponds to the customer's userId
  username: string;
  isVip: boolean;
  lastMessage: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
