
'use client';

const TOKEN_KEY = 'hustleflow_token';

const ANONYMOUS_NAMES = [
    'Panda', 'Turtle', 'Seahorse', 'Squirrel', 'Koala', 'Dolphin', 
    'Penguin', 'Otter', 'Quokka', 'Meerkat', 'Hedgehog', 'Alpaca'
];

export interface UserDetails {
    token: string;
    name: string; // Real name
    anonymousName: string; // Anonymous name
    room: string;
    contact?: string;
    expiresAt: number;
}

function generateToken(): string {
    return "hstl_" + Math.random().toString(36).substring(2, 6);
}

function getRandomAnonymousName(): string {
    return ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];
}

function getTokenWithExpiry(): UserDetails | null {
    if (typeof window === 'undefined') {
        return null;
    }
    const itemStr = localStorage.getItem(TOKEN_KEY);
    if (!itemStr) {
        return null;
    }
    try {
        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiresAt) {
            localStorage.removeItem(TOKEN_KEY);
            return null;
        }
        return item;
    } catch (e) {
        console.error("Error parsing user details from localStorage", e);
        localStorage.removeItem(TOKEN_KEY);
        return null;
    }
}

export function getUserDetails(): UserDetails | null {
    return getTokenWithExpiry();
}

export function saveUserDetails(details: { name: string; room: string; contact?: string }): UserDetails {
    const now = new Date();
    const expiresAt = now.getTime() + 24 * 60 * 60 * 1000; // 24 hours
    
    let existingDetails = getTokenWithExpiry();
    
    const token = existingDetails?.token || generateToken();
    const anonymousName = existingDetails?.anonymousName || getRandomAnonymousName();

    const userDetails: UserDetails = {
        token,
        anonymousName,
        ...details,
        expiresAt,
    };
    
    localStorage.setItem(TOKEN_KEY, JSON.stringify(userDetails));
    return userDetails;
}
