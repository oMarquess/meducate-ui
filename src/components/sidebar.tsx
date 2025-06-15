"use client";

import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { usePathname } from "next/navigation";
import Logo from '@/assets/logosaas.png';
import { useState, useEffect } from "react";
// import {MobileSidebar} from "./mobile-sidebar";

import { cn } from "@/lib/utils";
import { LayoutDashboard, StethoscopeIcon, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { FreeCounter } from "./free-counter";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Labs",
        icon: StethoscopeIcon,
        href: "/labs",
        color: "text-violet-500",
    },
];

interface SidebarProps {
    apiLimitCount: number;
    isPro: boolean;
}

const Sidebar = ({ apiLimitCount = 0, isPro = false }: SidebarProps) => {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleMobileSidebar = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Add/remove body class for main content margin adjustment
    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (isCollapsed) {
                document.body.classList.add('sidebar-collapsed');
                document.body.classList.remove('sidebar-expanded');
            } else {
                document.body.classList.add('sidebar-expanded');
                document.body.classList.remove('sidebar-collapsed');
            }
        }
        
        return () => {
            if (typeof document !== 'undefined') {
                document.body.classList.remove('sidebar-collapsed', 'sidebar-expanded');
            }
        };
    }, [isCollapsed]);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-gray-900 rounded-lg shadow-lg"
                onClick={toggleMobileSidebar}
            >
                {isMobileOpen ? (
                    <X className="h-5 w-5 text-white" />
                ) : (
                    <Menu className="h-5 w-5 text-white" />
                )}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out",
                    // Mobile styles
                    isMobileOpen ? "translate-x-0" : "-translate-x-full",
                    "md:translate-x-0",
                    // Desktop width - collapsed vs expanded
                    isCollapsed ? "md:w-16" : "md:w-64",
                    // Mobile always full width when open
                    "w-64"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <Link href="/dashboard" className={cn(
                            "flex items-center transition-all duration-300",
                            isCollapsed ? "md:opacity-0 md:pointer-events-none md:w-0 md:overflow-hidden" : "opacity-100"
                        )}>
                            <div className="relative w-8 h-8 mr-3 flex-shrink-0">
                                <Image src={Logo} alt="Meducate Logo" height={32} width={32} />
                            </div>
                            <h1 className={cn(
                                "font-bold text-gray-900 text-lg whitespace-nowrap",
                                montserrat.className
                            )}>
                                Meducate.AI
                            </h1>
                        </Link>
                        
                        {/* Collapse Button - Desktop Only */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200 transition-colors group"
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
                            ) : (
                                <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
                            )}
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 p-4">
                        <nav className="space-y-2">
                            {routes.map((route) => (
                                <Link
                                    href={route.href}
                                    key={route.href}
                                    className={cn(
                                        "group flex items-center rounded-lg transition-all duration-200 relative",
                                        pathname === route.href
                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                        isCollapsed ? "md:justify-center md:p-3" : "p-3"
                                    )}
                                    title={isCollapsed ? route.label : undefined}
                                >
                                    <route.icon className={cn(
                                        "h-5 w-5 transition-colors flex-shrink-0",
                                        pathname === route.href ? "text-blue-600" : route.color,
                                        isCollapsed ? "md:mr-0" : "mr-3"
                                    )} />
                                    <span className={cn(
                                        "font-medium transition-all duration-300 whitespace-nowrap",
                                        isCollapsed ? "md:opacity-0 md:w-0 md:overflow-hidden" : "opacity-100"
                                    )}>
                                        {route.label}
                                    </span>
                                    
                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && (
                                        <div className="hidden md:group-hover:block absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                                            {route.label}
                                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Footer - User Info or API Counter */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className={cn(
                            "flex items-center transition-all duration-300",
                            isCollapsed ? "md:justify-center" : "justify-start"
                        )}>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-semibold text-sm">U</span>
                            </div>
                            <div className={cn(
                                "ml-3 transition-all duration-300",
                                isCollapsed ? "md:opacity-0 md:w-0 md:overflow-hidden" : "opacity-100"
                            )}>
                                <p className="text-sm font-medium text-gray-900">User</p>
                                <p className="text-xs text-gray-500">Free Plan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;