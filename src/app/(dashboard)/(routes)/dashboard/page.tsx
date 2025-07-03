"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, StethoscopeIcon, History, FileText } from "lucide-react";

const tools = [
  {
    label: "New Lab Analysis",
    icon: StethoscopeIcon,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/labs",
    description: "Upload and analyze medical documents"
  },
  {
    label: "Interpretation History",
    icon: History,
    color: "text-blue-500", 
    bgColor: "bg-blue-500/10",
    href: "/interpretations",
    description: "View your past analysis results"
  },
];

const DashboardPage = () => {
  const router = useRouter();

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          Welcome to Meducate AI
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          Medical Reports Made Crystal Clear
        </p>
      </div>
      <div className="px-4 md:px-20 lg:px-32 space-y-4">
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-x-4">
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />
              </div>
              <div className="flex flex-col">
                <div className="font-semibold">{tool.label}</div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;