interface ChatMessage {
  senderId: number;
  senderEmail: string;
  messageContent: string;
  chatSessionId: string;
  recipientId?: number;
  timestamp: Date;
}
