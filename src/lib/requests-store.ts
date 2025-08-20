
import type { ExchangeRequest } from './types';
import { getUserDetails } from './user-store';

// In-memory store for demo purposes
const requests: ExchangeRequest[] = [];

export const getRequests = (): ExchangeRequest[] => {
    return requests.sort((a, b) => {
        // Sort by urgency: 'urgent' comes before 'flexible'
        if (a.urgency === 'urgent' && b.urgency === 'flexible') {
            return -1;
        }
        if (a.urgency === 'flexible' && b.urgency === 'urgent') {
            return 1;
        }
        // If urgency is the same, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

export const addRequest = (request: Omit<ExchangeRequest, 'id' | 'createdAt' | 'user' | 'status' | 'currency'>) => {
    const userDetails = getUserDetails();
    if (!userDetails?.name) {
        throw new Error("User details not found. Cannot create request.");
    }
    
    const newRequest: ExchangeRequest = {
        ...request,
        id: `req_${crypto.randomUUID()}`,
        currency: 'INR',
        status: 'Open',
        createdAt: new Date().toISOString(),
        user: {
            name: userDetails.name,
            avatarUrl: `https://placehold.co/150x150.png?text=${userDetails.name.charAt(0)}`,
            room: userDetails.room,
            contact: userDetails.contact,
            token: userDetails.token,
        }
    }
    requests.unshift(newRequest);
    return newRequest;
};
