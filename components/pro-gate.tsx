
"use client";

import { useProStatus } from "@/hooks/use-pro-status";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function ProGate({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isPro, isLoading } = useProStatus();

  if (isLoading) {
    return (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
        </div>
    );
  }

  if (isPro) {
    return <>{children}</>;
  }

  return fallback || (
    <div className="border border-yellow-200 bg-yellow-50 p-6 rounded-md flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
       <div className="p-3 bg-yellow-100 rounded-full">
         <Lock className="text-yellow-600 h-6 w-6" />
       </div>
       <div className="flex-1">
         <h3 className="font-semibold text-yellow-900 text-lg">Pro Feature Locked</h3>
         <p className="text-yellow-700">Upgrade to Pro to unlock unlimited access to this tool and more.</p>
       </div>
       <Button asChild className="whitespace-nowrap">
         <Link href="/pricing">Upgrade to Pro</Link>
       </Button>
    </div>
  );
}
