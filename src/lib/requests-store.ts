import type { ExchangeRequest } from './types';

const anonymousNames = [
  'Panda', 'Turtle', 'Seahorse', 'Tiger', 'Lion', 'Elephant', 'Dolphin', 'Koala', 'Giraffe', 'Zebra'
];

const getRandomName = () => anonymousNames[Math.floor(Math.random() * anonymousNames.length)];

// In-memory store for demo purposes
const requests: ExchangeRequest[] = [
  {
    id: 'req_1',
    amount: 40000,
    currency: 'INR',
    type: 'cash',
    urgency: 'urgent',
    status: 'Partially Matched',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    user: {
      name: getRandomName(),
      avatarUrl: 'https://placehold.co/150x150.png',
    },
  },
  {
    id: 'req_2',
    amount: 100000,
    currency: 'INR',
    type: 'digital',
    urgency: 'flexible',
    status: 'Open',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user: {
      name: getRandomName(),
      avatarUrl: 'https://placehold.co/150x150.png',
    },
  },
  {
    id: 'req_3',
    amount: 20000,
    currency: 'INR',
    type: 'cash',
    urgency: 'flexible',
    status: 'Fully Matched',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: {
      name: getRandomName(),
      avatarUrl: 'https://placehold.co/150x150.png',
    },
  },
    {
    id: 'req_4',
    amount: 80000,
    currency: 'INR',
    type: 'digital',
    urgency: 'urgent',
    status: 'Open',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      name: getRandomName(),
      avatarUrl: 'https://placehold.co/150x150.png',
    },
  },
];

export const getRequests = (): ExchangeRequest[] => {
    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addRequest = (request: Omit<ExchangeRequest, 'id' | 'createdAt' | 'user' | 'status' | 'currency'>) => {
    const newRequest: ExchangeRequest = {
        ...request,
        id: `req_${crypto.randomUUID()}`,
        currency: 'INR',
        status: 'Open',
        createdAt: new Date().toISOString(),
        user: {
            name: getRandomName(), // Assign a random anonymous name
            avatarUrl: 'https://placehold.co/150x150.png',
        }
    }
    requests.unshift(newRequest);
    return newRequest;
};
