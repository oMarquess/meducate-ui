import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prismadb from "./prismadb";
import { MAX_FREE_COUNTS } from "@/constant";

// Helper function to get user ID from token
const getUserIdFromToken = async (): Promise<string | null> => {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('access_token')?.value;
        
        if (!token) {
            return null;
        }

        // Note: In production, you should verify the JWT properly
        // For now, we'll decode without verification (not recommended for production)
        const decoded = jwt.decode(token) as any;
        return decoded?.sub || decoded?.user_id || null;
    } catch (error) {
        console.error('Error getting user ID from token:', error);
        return null;
    }
};

export const increaseApiLimit = async () => {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId
        }
    });

    if (userApiLimit) {
        await prismadb.userApiLimit.update({
            where: {userId: userId},
            data: { count: userApiLimit.count + 1},
        });
    } else{
        await prismadb.userApiLimit.create({
            data: {userId: userId, count: 1}
        });
    }
};

export const checkApiLimit = async () => {
    const userId = await getUserIdFromToken();

    if (!userId) {
        return false;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where:{
            userId: userId
        }
    });
    if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS){
        return true;
    }
    else{
        return false;
    }
};

export const getApiLimitCount = async () => {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return 0
    }
    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId
        }
    });

    if (!userApiLimit){
        return 0 
    }

    return userApiLimit.count;
}