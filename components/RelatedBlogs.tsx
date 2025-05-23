import React from "react";
import Link from "next/link";
import img from "next/img";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface RelatedBlogsProps {
  currentBlogId: string;
  tags: string[];
  limit?: number;
}

async function getRelatedBlogs({
  currentBlogId,
  tags,
  limit = 3,
}: RelatedBlogsProps) {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    const Blog = (await import("@/models/Blog")).default;
    await connectDB();

    // Find blogs that share tags with the current blog, but exclude the current blog
    const relatedBlogs = await Blog.find({
      _id: { $ne: currentBlogId }, // Exclude current blog
      tags: { $in: tags }, // Blogs that have at least one matching tag
      status: "published",
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // If there aren't enough related blogs by tags, fetch the most recent ones
    if (relatedBlogs.length < limit) {
      const recentBlogs = await Blog.find({
        _id: { $ne: currentBlogId },
        _id: { $nin: relatedBlogs.map((blog: any) => blog._id) }, // Exclude already fetched related blogs
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(limit - relatedBlogs.length)
        .lean();

      return JSON.parse(JSON.stringify([...relatedBlogs, ...recentBlogs]));
    }

    return JSON.parse(JSON.stringify(relatedBlogs));
  } catch (error) {
    console.error("Error fetching related blogs:", error);
    return [];
  }
}

export default async function RelatedBlogs({
  currentBlogId,
  tags,
  limit = 3,
}: RelatedBlogsProps) {
  const relatedBlogs = await getRelatedBlogs({ currentBlogId, tags, limit });

  if (relatedBlogs.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedBlogs.map((blog: any) => (
          <Link
            key={blog._id}
            href={`/blog/${blog.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border bg-background transition-colors hover:bg-accent/50"
          >
            {blog.img && (
              <div className="aspect-[16/9] w-full overflow-hidden">
                {" "}
                <img
                  src={
                    blog.img?.startsWith("http")
                      ? blog.img
                      : blog.img?.startsWith("/")
                      ? blog.img
                      : blog.img
                      ? `/${blog.img}`
                      : `https://placehold.co/400x225?text=${encodeURIComponent(
                          blog.title.slice(0, 20)
                        )}`
                  }
                  alt={blog.title}
                  width={400}
                  height={225}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex-1 p-4">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {format(new Date(blog.createdAt), "MMM d, yyyy")}
              </div>
              <h3 className="font-medium line-clamp-2 group-hover:underline">
                {blog.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
