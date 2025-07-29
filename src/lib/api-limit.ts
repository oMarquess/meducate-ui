import { MAX_FREE_COUNTS } from "@/constant";

// Since we're now client-side, these functions will be simplified
// In a real app, you'd make API calls to your backend for these operations
export const increaseApiLimit = async (userId: string) => {
    if (!userId) {
        console.warn('increaseApiLimit: No user ID provided, cannot increase API limit');
        return;
    }

    try {
        // Get current count from localStorage
        const storageKey = `api_limit_${userId}`;
        const currentValue = localStorage.getItem(storageKey);
        const currentCount = parseInt(currentValue || '0', 10);
        const newCount = currentCount + 1;
        
        // Store updated count
        localStorage.setItem(storageKey, newCount.toString());
        
        console.log('🚀 API Limit Increased:', {
            userId: userId,
            storageKey: storageKey,
            previousValue: currentValue,
            previousCount: currentCount,
            newCount: newCount,
            stored: localStorage.getItem(storageKey)
        });
        
        // You could make an API call here when backend is ready:
        // await fetch('/api/increase-limit', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
        console.error('Error increasing API limit:', error);
    }
};

export const checkApiLimit = async (userId: string): Promise<boolean> => {
    if (!userId) {
        return false;
    }

    try {
        // Check if user has reached the limit
        const currentCount = await getApiLimitCount(userId);
        const hasReachedLimit = currentCount >= MAX_FREE_COUNTS;
        
        console.log('Checking API limit for user:', userId, 'Count:', currentCount, 'Limit:', MAX_FREE_COUNTS, 'Can proceed:', !hasReachedLimit);
        return !hasReachedLimit;
        
        // You could make an API call here when backend is ready:
        // const response = await fetch('/api/check-limit', { headers: { Authorization: `Bearer ${token}` } });
        // return response.ok;
    } catch (error) {
        console.error('Error checking API limit:', error);
        return false;
    }
};

// Helper function to reset API limit count (useful for testing or admin purposes)
export const resetApiLimitCount = async (userId: string): Promise<void> => {
    if (!userId) {
        console.warn('No user ID provided, cannot reset API limit');
        return;
    }

    try {
        const storageKey = `api_limit_${userId}`;
        localStorage.removeItem(storageKey);
        console.log('API limit count reset for user:', userId);
    } catch (error) {
        console.error('Error resetting API limit count:', error);
    }
};

export const getApiLimitCount = async (userId: string): Promise<number> => {
    if (!userId) {
        console.warn('getApiLimitCount: No userId provided');
        return 0;
    }

    try {
        // Get count from localStorage
        const storageKey = `api_limit_${userId}`;
        const storageValue = localStorage.getItem(storageKey);
        const count = parseInt(storageValue || '0', 10);
        
        console.log('🔢 API Limit Debug:', {
            userId: userId,
            storageKey: storageKey,
            storageValue: storageValue,
            parsedCount: count,
            localStorage: typeof localStorage !== 'undefined' ? 'available' : 'unavailable'
        });
        
        return count;
        
        // You could make an API call here when backend is ready:
        // const response = await fetch('/api/limit-count', { headers: { Authorization: `Bearer ${token}` } });
        // const data = await response.json();
        // return data.count || 0;
    } catch (error) {
        console.error('Error getting API limit count:', error);
        return 0;
    }
};