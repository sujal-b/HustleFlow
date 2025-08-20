
'use client';

const TOKEN_KEY = 'hustleflow_token';

interface UserDetails {
    token: string;
    name: string;
    room: string;
    contact?: string;
    expiresAt: number;
}

function generateToken(): string {
    return "hstl_" + Math.random().toString(36).substring(2, 6);
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
    
    let token = getTokenWithExpiry()?.token;
    if (!token) {
        token = generateToken();
    }

    const userDetails: UserDetails = {
        token,
        ...details,
        expiresAt,
    };
    
    localStorage.setItem(TOKEN_KEY, JSON.stringify(userDetails));
    return userDetails;
}
