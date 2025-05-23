"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Tag, ChevronRight } from "lucide-react";

export function BlogCard({ blog }) {
  return (
    <Card className="h-full flex flex-col overflow-hidden transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      {blog.img && (
        <Link
          href={`/blog/${blog.slug}`}
          className="aspect-video w-full overflow-hidden"
        >
          <div className="relative aspect-video w-full">
            {" "}
            <img
              src={blog.img}
              alt={blog.title}
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}
      <CardContent className="py-4 flex-grow">
        <div className="flex flex-wrap gap-1 mb-3">
          {blog.tags?.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
          {blog.tags?.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              +{blog.tags.length - 3}
            </span>
          )}
        </div>

        <Link href={`/blog/${blog.slug}`} className="hover:underline">
          <h2 className="text-xl font-bold line-clamp-2 mb-2">{blog.title}</h2>
        </Link>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {format(new Date(blog.createdAt), "MMM d, yyyy")}
        </div>

        <p className="text-gray-600 line-clamp-3">
          {blog.content.replace(/<[^>]*>/g, "").slice(0, 150)}
          {blog.content.length > 150 ? "..." : ""}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/blog/${blog.slug}`} passHref className="w-full">
          <Button variant="outline" className="w-full group">
            Read More
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
