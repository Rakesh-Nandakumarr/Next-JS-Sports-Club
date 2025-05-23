import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle } from "lucide-react";

export default function EventNotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 mb-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
        <AlertTriangle size={40} />
      </div>

      <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>

      <p className="text-xl text-gray-600 max-w-md mb-8">
        Sorry, the event you're looking for doesn't exist or may have been
        removed.
      </p>

      <div className="space-x-4">
        <Button asChild>
          <Link href="/events">
            <Calendar className="mr-2 h-4 w-4" />
            Browse All Events
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
