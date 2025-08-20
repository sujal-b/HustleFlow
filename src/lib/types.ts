
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface ExchangeRequest {
  id: string;
  amount: number;
  currency: Currency;
  type: 'cash' | 'digital';
  location?: string;
  status: 'Open' | 'Partially Matched' | 'Fully Matched';
  createdAt: string; // ISO string
  user: {
    name: string;
    avatarUrl: string;
    rating: number;
  };
};
