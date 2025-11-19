'use client';

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/hooks/use-auth";
import { getApiLimitCount } from "@/lib/api-limit";
import { useEffect, useState, useCallback } from "react";

const DashboardLayout = ({
    children
}:{
    children: React.ReactNode;
}) => {
    const [apiLimitCount, setApiLimitCount] = useState(0);
    const { user } = useAuth();
    
    // Function to refresh API limit count
    const refreshApiLimitCount = useCallback(async () => {
        console.log('🔄 Dashboard refreshApiLimitCount called, user:', {
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email,
            userObject: user
        });
        
        if (user?.id) {
            try {
                const count = await getApiLimitCount(user.id);
                console.log('📊 Dashboard setting API count to:', count);
                setApiLimitCount(count);
            } catch (error) {
                console.error('Error fetching API limit count:', error);
                setApiLimitCount(0);
            }
        } else {
            console.warn('⚠️ Dashboard: No user ID available, setting count to 0');
            setApiLimitCount(0);
        }
    }, [user]);

    // Fetch actual API limit count on mount and user change
    useEffect(() => {
        refreshApiLimitCount();
    }, [refreshApiLimitCount]);

    // Refresh count every 30 seconds to pick up changes from other tabs
    useEffect(() => {
        const interval = setInterval(refreshApiLimitCount, 30000);
        return () => clearInterval(interval);
    }, [refreshApiLimitCount]);
    
    return (
        <RouteGuard requireAuth={true} requireVerification={true}>
            <div className="h-full relative">
                {/* Sidebar */}
                <Sidebar 
                    apiLimitCount={apiLimitCount}
                    isPro={false}  // Set to false by default since we're not using subscription
                />
                
                {/* Main Content - Light gray background extended to cover navbar */}
                <main className="md:ml-64 transition-all duration-300 ease-in-out bg-gray-50 min-h-screen">
                    <Navbar />
                    {children}
                </main>
            </div>
        </RouteGuard>
    );
}

export default DashboardLayout;