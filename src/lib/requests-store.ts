import { db, admin } from './firebase-admin'; // Import 'admin' here
import type { ExchangeRequest, TransactionOffer } from './types';
import type { UserDetails } from './user-store';

const requestsCollection = db.collection('requests');
const ADMIN_TOKEN = "admin_super_secret_token";

export const getRequests = async (): Promise<ExchangeRequest[]> => {
    const snapshot = await requestsCollection
        .orderBy('urgency', 'desc') // 'urgent' comes before 'flexible'
        .orderBy('createdAt', 'desc') // Then newest first
        .get();

    const now = new Date().getTime();
    const activeRequests: ExchangeRequest[] = [];

    snapshot.forEach(doc => {
        const request = doc.data() as ExchangeRequest;
        const createdAt = new Date(request.createdAt).getTime();
        const durationInMs = parseInt(request.duration) * 24 * 60 * 60 * 1000;

        if (request.status !== 'Fully Matched' && now >= (createdAt + durationInMs)) {
            // This is an expired request, you could optionally delete it here
            // For now, we'll just filter it out
        } else {
            activeRequests.push({ ...request, id: doc.id });
        }
    });

    return activeRequests;
};

type CreateRequestData = Omit<ExchangeRequest, 'id' | 'createdAt' | 'user' | 'status' | 'currency' | 'offers'>;

export const addRequest = async (
    request: CreateRequestData,
    userDetails: UserDetails,
): Promise<ExchangeRequest> => {
    if (!userDetails?.token) {
        throw new Error("User details not found. Cannot create request.");
    }
    
    const newRequest: Omit<ExchangeRequest, 'id'> = {
        ...request,
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
    
    const docRef = await requestsCollection.add(newRequest);
    return { ...newRequest, id: docRef.id };
};

type UpdateRequestData = Omit<ExchangeRequest, 'id' | 'createdAt' | 'user' | 'status' | 'currency' | 'offers' | 'realName' | 'avatarUrl' | 'room' | 'contact' | 'token'>;

export const updateRequest = async (
    id: string,
    updatedData: UpdateRequestData,
    userToken: string
) => {
    const docRef = requestsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new Error("Request not found.");
    }

    const request = doc.data() as ExchangeRequest;
    const isOwner = request.user.token === userToken;
    const isAdmin = userToken === ADMIN_TOKEN;

    if (!isOwner && !isAdmin) {
        throw new Error("You are not authorized to edit this request.");
    }

    await docRef.update(updatedData);
    return { ...request, ...updatedData, id: doc.id };
}

export const deleteRequest = async (id: string, userToken: string) => {
    const docRef = requestsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        throw new Error("Request not found.");
    }
    
    const request = doc.data() as ExchangeRequest;
    const isOwner = request.user.token === userToken;
    const isAdmin = userToken === ADMIN_TOKEN;

    if (!isOwner && !isAdmin) {
        throw new Error("You are not authorized to delete this request.");
    }
    
    await docRef.delete();
}

// --- Offer Management ---

export const makeOffer = async (requestId: string, offerAmount: number, userDetails: UserDetails) => {
    const docRef = requestsCollection.doc(requestId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new Error("Request not found.");
    }

    const request = doc.data() as ExchangeRequest;

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

    await docRef.update({
        offers: admin.firestore.FieldValue.arrayUnion(newOffer)
    });

    return newOffer;
}

export const acceptOffer = async (requestId: string, offerId: string, userToken: string) => {
    const docRef = requestsCollection.doc(requestId);
    const doc = await docRef.get();

    if (!doc.exists) throw new Error("Request not found.");

    const request = doc.data() as ExchangeRequest;

    if (request.user.token !== userToken) {
        throw new Error("You are not authorized to accept offers for this request.");
    }
    
    const updatedOffers = request.offers.map(o => {
        if (o.status === 'pending') {
            return o.id === offerId ? { ...o, status: 'accepted' } : { ...o, status: 'rejected' };
        }
        return o;
    });

    await docRef.update({
        offers: updatedOffers,
        status: 'Fully Matched'
    });
}

export const rejectOffer = async (requestId: string, offerId: string, userToken: string) => {
    const docRef = requestsCollection.doc(requestId);
    const doc = await docRef.get();

    if (!doc.exists) throw new Error("Request not found.");

    const request = doc.data() as ExchangeRequest;

    if (request.user.token !== userToken) {
        throw new Error("You are not authorized to reject offers for this request.");
    }
    
    const offerToReject = request.offers.find(o => o.id === offerId);
    if (!offerToReject || offerToReject.status !== 'pending') {
        throw new Error("Offer not found or already actioned.");
    }

    const updatedOffers = request.offers.map(o => 
        o.id === offerId ? { ...o, status: 'rejected' } : o
    );

    await docRef.update({ offers: updatedOffers });
}