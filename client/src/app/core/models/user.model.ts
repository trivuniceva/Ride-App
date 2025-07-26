export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  userRole: 'ADMINISTRATOR' | 'REGISTERED_USER' | 'DRIVER';
  address?: string;
  phone?: string;
  active: boolean;
  blockNote?: string | null;
  profilePic?: string;
  paypalEmail?: string;
  bitcoinAddress?: string;
}
