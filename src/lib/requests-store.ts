import type { ExchangeRequest } from './types';

const anonymousNames = [
  'Panda', 'Turtle', 'Seahorse', 'Tiger', 'Lion', 'Elephant', 'Dolphin', 'Koala', 'Giraffe', 'Zebra'
];

const getRandomName = () => anonymousNames[Math.floor(Math.random() * anonymousNames.length)];

// In-memory store for demo purposes
const requests: ExchangeRequest[] = [];

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
