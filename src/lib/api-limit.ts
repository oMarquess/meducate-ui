import jwt from 'jsonwebtoken';
import { MAX_FREE_COUNTS } from "@/constant";

// Helper function to get user ID from client-side token
const getUserIdFromToken = (): string | null => {
    try {
        // Try localStorage first, then cookies as fallback
        let token = localStorage.getItem('access_token');
        
        if (!token) {
            // Fallback to cookies
            const cookies = document.cookie.split(';');
            const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
            token = tokenCookie ? tokenCookie.split('=')[1] : null;
        }
        
        if (!token) {
            return null;
        }

        // Decode JWT to get user ID (client-side decoding is safe for non-sensitive data)
        const decoded = jwt.decode(token) as any;
        return decoded?.sub || decoded?.user_id || decoded?.id || null;
    } catch (error) {
        console.error('Error getting user ID from token:', error);
        return null;
    }
};

// Since we're now client-side, these functions will be simplified
// In a real app, you'd make API calls to your backend for these operations
export const increaseApiLimit = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
        console.warn('No user ID found, cannot increase API limit');
        return;
    }

    try {
        // In a real implementation, you'd make an API call to your backend
        // For now, we'll just log it
        console.log('API limit increased for user:', userId);
        
        // You could make an API call here:
        // await fetch('/api/increase-limit', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
        console.error('Error increasing API limit:', error);
    }
};

export const checkApiLimit = async (): Promise<boolean> => {
    const userId = getUserIdFromToken();
    
    if (!userId) {
        return false;
    }

    try {
        // In a real implementation, you'd make an API call to check the limit
        // For now, we'll return true (unlimited for development)
        console.log('Checking API limit for user:', userId);
        return true;
        
        // You could make an API call here:
        // const response = await fetch('/api/check-limit', { headers: { Authorization: `Bearer ${token}` } });
        // return response.ok;
    } catch (error) {
        console.error('Error checking API limit:', error);
        return false;
    }
};

export const getApiLimitCount = async (): Promise<number> => {
    const userId = getUserIdFromToken();
    if (!userId) {
        return 0;
    }

    try {
        // In a real implementation, you'd make an API call to get the count
        // For now, we'll return 0
        console.log('Getting API limit count for user:', userId);
        return 0;
        
        // You could make an API call here:
        // const response = await fetch('/api/limit-count', { headers: { Authorization: `Bearer ${token}` } });
        // const data = await response.json();
        // return data.count || 0;
    } catch (error) {
        console.error('Error getting API limit count:', error);
        return 0;
    }
};