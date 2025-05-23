import React from "react";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { format } from "date-fns";
import { Calendar, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RelatedBlogs from "@/components/RelatedBlogs";
import BlogShareButtons from "@/components/BlogShareButtons";

type Props = {
  params: { slug: string };
};

// Generate metadata for SEO
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    return {
      title: "Blog not found",
      description: "The requested blog could not be found.",
    };
  }

  // Extract a clean description from the content
  const description = blog.content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .slice(0, 160); // Limit to 160 chars for meta description

  return {
    title: blog.title,
    description,
    openGraph: {
      title: blog.title,
      description,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      images: blog.img ? [{ url: blog.img }] : undefined,
      tags: blog.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: blog.img ? [blog.img] : undefined,
    },
  };
}

async function getBlogBySlug(slug: string) {
  try {
    await connectDB();
    const blog = await Blog.findOne({
      slug: slug,
      status: "published", // Only get published blogs
    }).lean();

    if (!blog) return null;

    return JSON.parse(JSON.stringify(blog)); // Serialize for Next.js
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export default async function BlogPost({ params }: Props) {
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  // Format the date for display
  const formattedDate = format(new Date(blog.createdAt), "MMMM d, yyyy");

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 md:px-0">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            {formattedDate}
          </div>
          {blog.tags && blog.tags.length > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    {tag}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900">{blog.title}</h1>
      </div>

      {blog.img && (
        <div className="relative w-full h-[400px] mb-8 overflow-hidden rounded-lg">
          {" "}
          <img
            src={
              blog.img?.startsWith("http")
                ? blog.img
                : blog.img?.startsWith("/")
                ? blog.img
                : blog.img
                ? `/${blog.img}`
                : `https://placehold.co/1200x400?text=${encodeURIComponent(
                    blog.title.slice(0, 30)
                  )}`
            }
            alt={blog.title}
            className="object-cover h-full w-full"
          />
        </div>
      )}

      <Card className="p-6 md:p-8 mb-8">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </Card>

      <Separator className="my-8" />

      <BlogShareButtons blogTitle={blog.title} />

      {/* Related Blogs Component */}
      {blog.tags && blog.tags.length > 0 && (
        <RelatedBlogs currentBlogId={blog._id} tags={blog.tags} />
      )}
    </div>
  );
}
