
import type { ExchangeRequest, TransactionOffer } from './types';
import type { UserDetails } from './user-store';

// In-memory store for demo purposes
let requests: ExchangeRequest[] = [];

export const getRequests = (): ExchangeRequest[] => {
    // Expire requests that are older than their duration
    const now = new Date().getTime();
    const activeRequests = requests.filter(req => {
        if (req.status === 'Fully Matched') return true; // Keep matched requests regardless of expiry for now
        const createdAt = new Date(req.createdAt).getTime();
        const durationInMs = parseInt(req.duration) * 24 * 60 * 60 * 1000;
        return now < (createdAt + durationInMs);
    });
    requests = activeRequests;

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

type CreateRequestData = Omit<ExchangeRequest, 'id' | 'createdAt' | 'user' | 'status' | 'currency' | 'offers'>;

export const addRequest = (
    request: CreateRequestData,
    userDetails: UserDetails,
) => {
    if (!userDetails?.token) {
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
            name: userDetails.anonymousName,
            realName: userDetails.name,
            avatarUrl: `https://placehold.co/150x150.png?text=${userDetails.anonymousName.charAt(0)}`,
            room: userDetails.room,
            contact: userDetails.contact,
        },
        offers: []
    }
    requests.unshift(newRequest);
    return newRequest;
};

type UpdateRequestData = Omit<ExchangeRequest, 'id' | 'createdAt' | 'user' | 'status' | 'currency' | 'offers' | 'realName' | 'avatarUrl' | 'room' | 'contact' | 'token'>;

export const updateRequest = (
    id: string,
    updatedData: UpdateRequestData,
    userToken: string
) => {
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
        throw new Error("Request not found.");
    }
    
    if (requests[requestIndex].user.token !== userToken) {
        throw new Error("You are not authorized to edit this request.");
    }

    requests[requestIndex] = {
        ...requests[requestIndex],
        ...updatedData,
        // Ensure non-editable fields are preserved
        createdAt: requests[requestIndex].createdAt,
        user: requests[requestIndex].user,
        status: requests[requestIndex].status,
        offers: requests[requestIndex].offers,
    };
    return requests[requestIndex];
}

export const deleteRequest = (id: string, userToken: string) => {
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
        // Silently fail if not found, or throw error. Let's throw.
        throw new Error("Request not found.");
    }
    
    if (requests[requestIndex].user.token !== userToken) {
        throw new Error("You are not authorized to delete this request.");
    }
    requests.splice(requestIndex, 1);
}

// --- Offer Management ---

export const makeOffer = (requestId: string, offerAmount: number, userDetails: UserDetails) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) {
        throw new Error("Request not found.");
    }
    if (request.user.token === userDetails.token) {
        throw new Error("You cannot make an offer on your own request.");
    }
    if (request.offers.some(o => o.user.token === userDetails.token)) {
        throw new Error("You have already made an offer on this request.");
    }

    const newOffer: TransactionOffer = {
        id: `offer_${crypto.randomUUID()}`,
        amount: offerAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        user: {
            token: userDetails.token,
            name: userDetails.anonymousName,
            realName: userDetails.name,
            avatarUrl: `https://placehold.co/150x150.png?text=${userDetails.anonymousName.charAt(0)}`,
            room: userDetails.room,
            contact: userDetails.contact,
        }
    };
    request.offers.push(newOffer);
    return newOffer;
}

export const acceptOffer = (requestId: string, offerId: string, userToken: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) {
        throw new Error("Request not found.");
    }
    if (request.user.token !== userToken) {
        throw new Error("You are not authorized to accept offers for this request.");
    }
    const offer = request.offers.find(o => o.id === offerId);
    if (!offer) {
        throw new Error("Offer not found.");
    }

    // Reject all other pending offers and accept this one
    request.offers.forEach(o => {
        if (o.status === 'pending') {
            o.status = o.id === offerId ? 'accepted' : 'rejected';
        }
    });

    // Mark request as fully matched
    request.status = 'Fully Matched';
}

export const rejectOffer = (requestId: string, offerId: string, userToken: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) {
        throw new Error("Request not found.");
    }
    if (request.user.token !== userToken) {
        throw new Error("You are not authorized to reject offers for this request.");
    }
    const offer = request.offers.find(o => o.id === offerId);
    if (!offer) {
        throw new Error("Offer not found.");
    }
    if (offer.status !== 'pending') {
        throw new Error("This offer has already been actioned.");
    }

    offer.status = 'rejected';
}
