import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { getApiLimitCount } from "@/lib/api-limit";


const DashboardLayout = async ({
    children
}:{
    children: React.ReactNode;
}) => {
    const apiLimitCount = await getApiLimitCount();
    
    return (
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
    );
}

export default DashboardLayout;