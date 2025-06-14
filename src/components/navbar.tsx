import { UserButton } from "@/components/auth/user-button";
import MobileSidebar from "@/components/mobile-sidebar";

const Navbar = () => {
    
    return ( 
         
        <div className="flex items-center p-4">
            
            

            <div className="flex w-full justify-end">
                <UserButton afterSignOutUrl="/" />
            </div>
        </div>
     );
}
 
export default Navbar;