import type { ExchangeRequest } from './types';

// In-memory store for demo purposes
const requests: ExchangeRequest[] = [
  {
    id: 'req_1',
    amount: 500,
    currency: 'USD',
    type: 'cash',
    location: 'Grand Central, NYC',
    status: 'Partially Matched',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    user: {
      name: 'Alex Doe',
      avatarUrl: 'https://placehold.co/150x150.png',
      rating: 4.8,
    },
  },
  {
    id: 'req_2',
    amount: 1200,
    currency: 'EUR',
    type: 'digital',
    status: 'Open',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user: {
      name: 'Samantha Bee',
      avatarUrl: 'https://placehold.co/150x150.png',
      rating: 4.9,
    },
  },
  {
    id: 'req_3',
    amount: 250,
    currency: 'GBP',
    type: 'cash',
    location: 'London Bridge',
    status: 'Fully Matched',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: {
      name: 'John Smith',
      avatarUrl: 'https://placehold.co/150x150.png',
      rating: 4.5,
    },
  },
    {
    id: 'req_4',
    amount: 80000,
    currency: 'JPY',
    type: 'digital',
    status: 'Open',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      name: 'Yuki Tanaka',
      avatarUrl: 'https://placehold.co/150x150.png',
      rating: 5.0,
    },
  },
];

export const getRequests = (): ExchangeRequest[] => {
    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addRequest = (request: Omit<ExchangeRequest, 'id' | 'createdAt' | 'user' | 'status'>) => {
    const newRequest: ExchangeRequest = {
        ...request,
        id: `req_${crypto.randomUUID()}`,
        status: 'Open',
        createdAt: new Date().toISOString(),
        user: {
            name: 'Jane Doe', // Current user placeholder
            avatarUrl: 'https://placehold.co/150x150.png',
            rating: 4.7
        }
    }
    requests.unshift(newRequest);
    return newRequest;
};
