
export type Currency = 'INR';

export interface UserInfo {
  token: string;
  name: string; // This will be the anonymous name for public display
  realName: string; // This is the actual user name, hidden until confirmed
  avatarUrl: string;
  room: string;
  contact?: string;
}

export interface TransactionOffer {
  id: string;
  user: UserInfo;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string; // ISO string
}

export interface ExchangeRequest {
  id: string;
  amount: number;
  currency: Currency;
  type: 'cash' | 'digital';
  urgency: 'urgent' | 'flexible';
  duration: '1' | '3' | '7'; // Duration in days
  status: 'Open' | 'Partially Matched' | 'Fully Matched';
  createdAt: string; // ISO string
  user: UserInfo;
  offers: TransactionOffer[];
};
