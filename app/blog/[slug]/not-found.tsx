import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

export default function BlogNotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 mb-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
        <FileX size={40} />
      </div>

      <h1 className="text-4xl font-bold mb-4">Blog Not Found</h1>

      <p className="text-xl text-gray-600 max-w-md mb-8">
        Sorry, the blog post you're looking for doesn't exist or may have been
        removed.
      </p>

      <div className="space-x-4">
        <Button asChild>
          <Link href="/blogs">Browse All Blogs</Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
