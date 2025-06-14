'use client';

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

const DashboardLayout = ({
    children
}:{
    children: React.ReactNode;
}) => {
    const [apiLimitCount, setApiLimitCount] = useState(0);
    const { user } = useAuth();
    
    // For now, we'll set a default API limit count
    // You can implement proper API limit tracking later
    useEffect(() => {
        if (user) {
            // You could fetch the actual API limit count from your backend here
            setApiLimitCount(0);
        }
    }, [user]);
    
    return (
        <RouteGuard requireAuth={true} requireVerification={true}>
            <div className="h-full relative">
                <div className="h-full md:flex
                md:flex-col md:fixed md:inset-y-0 z-[80]
                bg-gray-900">
                    <Sidebar 
                        apiLimitCount={apiLimitCount}
                        isPro={false}  // Set to false by default since we're not using subscription
                    />
                </div>
                <main className="md:pl-72 pb-10">
                    <Navbar />
                    {children}
                </main>
            </div>
        </RouteGuard>
    );
}

export default DashboardLayout;