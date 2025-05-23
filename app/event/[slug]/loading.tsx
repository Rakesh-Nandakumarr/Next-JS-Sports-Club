import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function EventLoading() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section Skeleton */}
      <div className="relative bg-black h-[400px]">
        <div className="relative z-10 container mx-auto px-4 py-20">
          <Skeleton className="h-10 w-40 mb-6" />

          <div className="max-w-4xl">
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>

            <Skeleton className="h-12 w-full max-w-lg mb-6" />

            <div className="space-y-3 max-w-2xl">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-5/6" />
              <Skeleton className="h-8 w-4/6" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            </Card>

            <Card className="p-6 mb-8">
              <Skeleton className="h-8 w-60 mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center p-4 border rounded-lg"
                  >
                    <Skeleton className="w-12 h-12 mr-4 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <Skeleton className="h-8 w-40 mb-4" />

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-full md:col-span-2" />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-full md:col-span-2" />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-full md:col-span-2" />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-full md:col-span-2" />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="md:col-span-2 flex gap-2">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6">
              <div className="mb-6">
                <Skeleton className="h-7 w-40 mb-4" />
                <Skeleton className="h-5 w-full mb-4" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>

              <div className="mb-6">
                <Skeleton className="h-7 w-32 mb-4" />
                <Skeleton className="h-5 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div>
                <Skeleton className="h-7 w-40 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center p-3 border rounded-lg"
                    >
                      <Skeleton className="h-12 w-12 rounded-md mr-3" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
