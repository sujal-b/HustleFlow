
export type Currency = 'INR';

export interface ExchangeRequest {
  id: string;
  amount: number;
  currency: Currency;
  type: 'cash' | 'digital';
  urgency: 'urgent' | 'flexible';
  status: 'Open' | 'Partially Matched' | 'Fully Matched';
  createdAt: string; // ISO string
  user: {
    name: string;
    avatarUrl: string;
    rating: number;
  };
};
