import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function LoadingEvents() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <div className="w-full h-[400px] bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-12 w-full max-w-lg mb-4" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <Skeleton className="h-6 w-48" />
              <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-400"></div>
              <Skeleton className="h-6 w-36" />
            </div>
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Upcoming Events Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-10 w-60 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Past Events Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Browse by Sport Section */}
        <section className="mt-16 pt-16 border-t">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-3" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <Skeleton className="aspect-video w-full" />

      <CardContent className="flex-grow p-5">
        <div className="mb-3">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-5/6" />
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
