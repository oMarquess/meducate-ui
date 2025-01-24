"use client";

import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { usePathname } from "next/navigation";
import Logo from '@/assets/logosaas.png';
import { useState } from "react";

import { cn } from "@/lib/utils";
import { LayoutDashboard, StethoscopeIcon, Menu, X } from "lucide-react";
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
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Hamburger Menu Button */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-gray-900 rounded-lg"
                onClick={toggleSidebar}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <Menu className="h-6 w-6 text-white" />
                )}
            </button>

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-[#111827] text-white transition-transform duration-300 ease-in-out transform",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    "md:translate-x-0" // Always visible on medium and larger screens
                )}
            >
                <div className="space-y-4 py-4 flex flex-col h-full">
                    <div className="px-3 py-2 flex-1">
                        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                            <div className="relative w-8 h-8 mr-4">
                                <Image src={Logo} alt="Saas Logo" height={50} width={50} />
                            </div>
                            <h1 className="text-sm font-bold">Meducate.AI</h1>
                        </Link>
                        <div className="space-y-1">
                            {routes.map((route) => (
                                <Link
                                    href={route.href}
                                    key={route.href}
                                    className={cn(
                                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                        pathname === route.href
                                            ? "text-white bg-white/10"
                                            : "text-zinc-400"
                                    )}
                                >
                                    <div className="flex items-center flex-1">
                                        <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                        {route.label}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} />
                </div>
            </div>
        </>
    );
};

export default Sidebar;