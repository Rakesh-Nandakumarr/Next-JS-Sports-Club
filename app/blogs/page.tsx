import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar, Tag, ChevronRight, ChevronLeft } from "lucide-react";
import MainLayout from "@/app/main-layout";
import ClientSideSearch from "./search-component";

export const dynamic = "force-dynamic"; // Disable static rendering since we need fresh data

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Blog Articles | Latest News and Updates",
  description:
    "Explore our collection of articles, news, and insights on sports, events, and more.",
  openGraph: {
    title: "Blog Articles | Latest News and Updates",
    description:
      "Explore our collection of articles, news, and insights on sports, events, and more.",
    type: "website",
  },
};

// Number of blogs per page
const BLOGS_PER_PAGE = 9;

// Function to get blog posts with pagination
async function getBlogs(page = 1, searchQuery = "") {
  try {
    await connectDB();

    // Create filter for published blogs
    const filter: any = { status: "published" };

    // Add search query filter if provided
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
        { tags: { $in: [new RegExp(searchQuery, "i")] } },
      ];
    }

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments(filter);

    // Calculate pagination values
    const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);
    const skip = (page - 1) * BLOGS_PER_PAGE;

    // Get filtered blogs with pagination
    const blogs = await Blog.find(filter)
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(BLOGS_PER_PAGE)
      .lean();

    return {
      blogs: JSON.parse(JSON.stringify(blogs)), // Serialize for Next.js
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
      },
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return {
      blogs: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalBlogs: 0,
      },
    };
  }
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  // Get the current page from query params
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const { blogs, pagination } = await getBlogs(currentPage);

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-primary/10 to-background py-16 mb-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Blogs
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our latest articles, news, and insights.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No blogs published yet</h2>
            <p className="text-gray-500 mt-3">
              Check back soon for new content!
            </p>
          </div>
        ) : (
          <ClientSideSearch
            initialBlogs={blogs}
            initialPagination={pagination}
          />
        )}
      </div>
    </MainLayout>
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
          {blog.tags?.slice(0, 3).map((tag: string, i: number) => (
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

function Pagination({
  pagination,
}: {
  pagination: { currentPage: number; totalPages: number };
}) {
  const { currentPage, totalPages } = pagination;

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
          href={`/blogs?page=${currentPage - 1}`}
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
              href={`/blogs?page=${page}`}
              active={page === currentPage}
            >
              {page}
            </PaginationButton>
          );
        })}

        <PaginationButton
          href={`/blogs?page=${currentPage + 1}`}
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
