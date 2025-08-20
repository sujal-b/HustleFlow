
import type { ExchangeRequest } from './types';
import type { UserDetails } from './user-store';

// In-memory store for demo purposes
const requests: ExchangeRequest[] = [];

export const getRequests = (): ExchangeRequest[] => {
    // Expire requests that are older than their duration
    const now = new Date().getTime();
    const activeRequests = requests.filter(req => {
        const createdAt = new Date(req.createdAt).getTime();
        const durationInMs = parseInt(req.duration) * 24 * 60 * 60 * 1000;
        return now < (createdAt + durationInMs);
    });

    return activeRequests.sort((a, b) => {
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

export const addRequest = (
    request: Omit<ExchangeRequest, 'id' | 'createdAt' | 'user' | 'status' | 'currency'>,
    userDetails: UserDetails | null,
) => {
    if (!userDetails?.name || !userDetails.anonymousName) {
        throw new Error("User details not found. Cannot create request.");
    }
    
    const newRequest: ExchangeRequest = {
        ...request,
        id: `req_${crypto.randomUUID()}`,
        currency: 'INR',
        status: 'Open',
        createdAt: new Date().toISOString(),
        user: {
            token: userDetails.token,
            name: userDetails.anonymousName, // Use anonymous name for public display
            realName: userDetails.name, // Store real name for confirmed transactions
            avatarUrl: `https://placehold.co/150x150.png?text=${userDetails.anonymousName.charAt(0)}`,
            room: userDetails.room,
            contact: userDetails.contact,
        }
    }
    requests.unshift(newRequest);
    return newRequest;
};
