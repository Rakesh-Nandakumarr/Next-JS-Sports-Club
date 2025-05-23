import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import img from "next/img";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Calendar,
  Tag as TagIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic"; // Disable static rendering

type Props = {
  params: { tag: string };
  searchParams: { page?: string };
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);

  return {
    title: `${tag} - Blog Articles`,
    description: `Explore our collection of articles about ${tag}`,
    openGraph: {
      title: `${tag} - Blog Articles`,
      description: `Explore our collection of articles about ${tag}`,
    },
  };
}

// Number of blogs per page
const BLOGS_PER_PAGE = 9;

// Function to get blog posts by tag with pagination
async function getBlogsByTag(tag: string, page = 1) {
  try {
    await connectDB();

    // Decode the tag from the URL
    const decodedTag = decodeURIComponent(tag);

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments({
      tags: decodedTag,
      status: "published",
    });

    // Calculate pagination values
    const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);
    const skip = (page - 1) * BLOGS_PER_PAGE;

    // Get published blogs with the specified tag
    const blogs = await Blog.find({
      tags: decodedTag,
      status: "published",
    })
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(BLOGS_PER_PAGE)
      .lean();

    return {
      tag: decodedTag,
      blogs: JSON.parse(JSON.stringify(blogs)),
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
      },
    };
  } catch (error) {
    console.error("Error fetching blogs by tag:", error);
    return {
      tag: decodeURIComponent(tag),
      blogs: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalBlogs: 0,
      },
    };
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  // Get the current page from query params
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const { tag, blogs, pagination } = await getBlogsByTag(
    params.tag,
    currentPage
  );

  return (
    <>
      <div className="bg-gradient-to-b from-primary/10 to-background py-16 mb-8">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-4 rounded-full bg-primary/10 px-4 py-1">
            <TagIcon className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{tag}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Articles tagged with "{tag}"
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our collection of articles related to {tag}
          </p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/blogs" className="inline-flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to All Blogs
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">
              No blogs found for "{tag}"
            </h2>
            <p className="text-gray-500 mt-3">Try browsing all blogs instead</p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/blogs">Browse All Blogs</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination pagination={pagination} tag={tag} />
            )}
          </>
        )}
      </div>
    </>
  );
}

function BlogCard({ blog }: { blog: any }) {
  return (
    <Card className="h-full flex flex-col overflow-hidden transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      {blog.img && (
        <Link
          href={`/blog/${blog.slug}`}
          className="aspect-video w-full overflow-hidden"
        >
          <div className="relative aspect-video w-full">
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
          {blog.tags?.slice(0, 3).map((tag: string, i: number) => (
            <Link
              key={i}
              href={`/blogs/tag/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </Link>
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

function Pagination({
  pagination,
  tag,
}: {
  pagination: { currentPage: number; totalPages: number };
  tag: string;
}) {
  const { currentPage, totalPages } = pagination;
  const encodedTag = encodeURIComponent(tag);

  // Generate page numbers to display
  const pageNumbers = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow) {
    // Show all pages if there are fewer than maxPagesToShow
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always show first page
    pageNumbers.push(1);

    // Calculate range around current page
    const leftBound = Math.max(2, currentPage - 1);
    const rightBound = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after first page if needed
    if (leftBound > 2) {
      pageNumbers.push("ellipsis-start");
    }

    // Add pages around current page
    for (let i = leftBound; i <= rightBound; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis before last page if needed
    if (rightBound < totalPages - 1) {
      pageNumbers.push("ellipsis-end");
    }

    // Always show last page
    pageNumbers.push(totalPages);
  }

  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center space-x-1">
        <PaginationButton
          href={`/blogs/tag/${encodedTag}?page=${currentPage - 1}`}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </PaginationButton>

        {pageNumbers.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <span key={page} className="px-4 py-2">
                ...
              </span>
            );
          }

          return (
            <PaginationButton
              key={index}
              href={`/blogs/tag/${encodedTag}?page=${page}`}
              active={page === currentPage}
            >
              {page}
            </PaginationButton>
          );
        })}

        <PaginationButton
          href={`/blogs/tag/${encodedTag}?page=${currentPage + 1}`}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({
  children,
  href,
  active = false,
  disabled = false,
}: {
  children: React.ReactNode;
  href: string;
  active?: boolean;
  disabled?: boolean;
}) {
  const className = `
    flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md
    ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-background hover:bg-accent"
    }
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
  `;

  if (disabled) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
