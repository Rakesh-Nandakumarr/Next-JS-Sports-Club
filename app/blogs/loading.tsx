import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function Loading() {
  return (
    <>
      <div className="bg-gradient-to-b from-primary/10 to-background py-16 mb-8">
        <div className="container mx-auto text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-[500px] max-w-full mx-auto" />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
        </div>
      </div>
    </>
  );
}

function BlogCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="py-4 flex-grow space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>

        <Skeleton className="h-6 w-[250px]" />
        <Skeleton className="h-4 w-24" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
