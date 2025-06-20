export interface BlockUserRequest {
  userId: number;
  isBlocked: boolean;
  blockNote?: string;
}
