
export type Currency = 'INR';

export interface ExchangeRequest {
  id: string;
  amount: number;
  currency: Currency;
  type: 'cash' | 'digital';
  urgency: 'urgent' | 'flexible';
  duration: '1' | '3' | '7'; // Duration in days
  status: 'Open' | 'Partially Matched' | 'Fully Matched';
  createdAt: string; // ISO string
  user: {
    token: string;
    name: string;
    avatarUrl: string;
    room: string;
    contact?: string;
  };
};
