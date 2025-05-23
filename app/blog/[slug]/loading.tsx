import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function BlogLoading() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 md:px-0">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-12 w-full mb-2" />
      </div>

      <Skeleton className="w-full h-[400px] mb-8 rounded-lg" />

      <Card className="p-6 md:p-8 mb-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-5/6" />

          <div className="py-2"></div>

          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />

          <div className="py-2"></div>

          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </Card>

      <Separator className="my-8" />

      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
