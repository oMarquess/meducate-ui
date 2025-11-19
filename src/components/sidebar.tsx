"use client";

import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { usePathname } from "next/navigation";
import Logo from '@/assets/logosaas.png';
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  StethoscopeIcon, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Key, 
  BookOpen, 
  BarChart3, 
  History,
  CreditCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FreeCounter } from "./free-counter";
import { MAX_FREE_COUNTS } from "@/constant";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const navigationGroups = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
      }
    ]
  },
  {
    label: "Lab Analysis",
    items: [
      {
        label: "New Analysis",
        icon: StethoscopeIcon,
        href: "/labs",
        color: "text-violet-500",
        badge: "primary",
        isHighlight: true
      },
      {
        label: "History",
        icon: History,
        href: "/interpretations",
        color: "text-blue-500",
      }
    ]
  },
  {
    label: "Developer",
    items: [
      {
        label: "API Keys",
        icon: Key,
        href: "/api-keys",
        color: "text-orange-500",
      },
      {
        label: "Documentation",
        icon: BookOpen,
        href: "/api-docs",
        color: "text-green-500",
      }
    ]
  },
  {
    label: "Account",
    items: [
      {
        label: "Usage",
        icon: BarChart3,
        href: "/usage",
        color: "text-emerald-500",
      },
      {
        label: "Billing",
        icon: CreditCard,
        href: "/billing",
        color: "text-purple-500",
      }
    ]
  }
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
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-background border border-border rounded-lg shadow-lg"
                onClick={toggleMobileSidebar}
            >
                {isMobileOpen ? (
                    <X className="h-5 w-5 text-foreground" />
                ) : (
                    <Menu className="h-5 w-5 text-foreground" />
                )}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 bg-card border-r border-border shadow-lg transition-all duration-300 ease-in-out",
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
                    {/* Compact Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <Link href="/dashboard" className={cn(
                            "flex items-center transition-all duration-300",
                            isCollapsed ? "md:opacity-0 md:pointer-events-none md:w-0 md:overflow-hidden" : "opacity-100"
                        )}>
                            <div className="relative w-7 h-7 mr-2.5 flex-shrink-0">
                                <Image src={Logo} alt="Meducate Logo" height={28} width={28} />
                            </div>
                            <h1 className={cn(
                                "font-bold text-foreground text-base whitespace-nowrap",
                                montserrat.className
                            )}>
                                Meducate.AI
                            </h1>
                        </Link>
                        
                        {/* Collapse Button - Desktop Only */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden md:flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors group"
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                            ) : (
                                <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                            )}
                        </button>
                    </div>

                    {/* Navigation - Optimized Spacing */}
                    <div className="flex-1 px-3 py-4">
                        <nav className="space-y-4">
                            {navigationGroups.map((group, groupIndex) => (
                                <div key={group.label}>
                                    {/* Compact Group Label */}
                                    <div className={cn(
                                        "transition-all duration-300",
                                        isCollapsed ? "md:opacity-0 md:h-0 md:overflow-hidden" : "opacity-100"
                                    )}>
                                        <h2 className="mb-2 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                            {group.label}
                                        </h2>
                                    </div>
                                    
                                    {/* Compact Group Items */}
                                    <div className="space-y-0.5">
                                        {group.items.map((item) => (
                                            <Link
                                                href={item.href}
                                                key={item.href}
                                                className={cn(
                                                    "group flex items-center rounded-lg transition-all duration-200 relative",
                                                    pathname === item.href
                                                        ? "bg-primary/10 text-primary border border-primary/20"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                                    isCollapsed ? "md:justify-center md:p-2.5" : "p-2.5",
                                                    item.isHighlight && "hover:bg-violet-500/10"
                                                )}
                                                title={isCollapsed ? item.label : undefined}
                                            >
                                                <item.icon className={cn(
                                                    "h-4 w-4 transition-colors flex-shrink-0",
                                                    pathname === item.href ? "text-primary" : item.color,
                                                    isCollapsed ? "md:mr-0" : "mr-2.5"
                                                )} />
                                                
                                                <div className={cn(
                                                    "flex-1 flex items-center justify-between transition-all duration-300",
                                                    isCollapsed ? "md:opacity-0 md:w-0 md:overflow-hidden" : "opacity-100"
                                                )}>
                                                    <span className="font-medium text-sm whitespace-nowrap">
                                                        {item.label}
                                                    </span>
                                                    {item.badge && (
                                                        <Badge 
                                                            variant={item.badge === "primary" ? "default" : "secondary"}
                                                            className="ml-2 text-[10px] h-5 px-1.5"
                                                        >
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                {/* Enhanced Tooltip for collapsed state */}
                                                {isCollapsed && (
                                                    <div className="hidden md:group-hover:block absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border">
                                                        <div className="font-medium">{item.label}</div>
                                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45 border-l border-b"></div>
                                                    </div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                    
                                    {/* Compact Separator between groups (except last) */}
                                    {groupIndex < navigationGroups.length - 1 && (
                                        <div className={cn(
                                            "transition-all duration-300 mt-3 mx-2",
                                            isCollapsed ? "md:opacity-0" : "opacity-100"
                                        )}>
                                            <Separator />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Compact Footer - User Info */}
                    <div className="px-3 py-3 border-t border-border bg-muted/30">
                        <div className={cn(
                            "flex items-center transition-all duration-300",
                            isCollapsed ? "md:justify-center" : "justify-start"
                        )}>
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-semibold text-xs">U</span>
                            </div>
                            <div className={cn(
                                "ml-2.5 transition-all duration-300",
                                isCollapsed ? "md:opacity-0 md:w-0 md:overflow-hidden" : "opacity-100"
                            )}>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">User</p>
                                        <p className="text-xs text-muted-foreground">Free Plan</p>
                                    </div>
                                    {!isPro && (
                                        <div className="ml-6">
                                            <Badge 
                                                variant="secondary" 
                                                className="text-xs h-6 px-2 bg-blue-100 text-blue-700 border-blue-200 font-medium"
                                            >
                                                {apiLimitCount}/{MAX_FREE_COUNTS}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Usage Progress Bar */}
                        {!isPro && !isCollapsed && (
                            <div className="mt-2 px-0.5">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>Usage</span>
                                    <span>{Math.round((apiLimitCount / MAX_FREE_COUNTS) * 100)}%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-1.5">
                                    <div 
                                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${(apiLimitCount / MAX_FREE_COUNTS) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;