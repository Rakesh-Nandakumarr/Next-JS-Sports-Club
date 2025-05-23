"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SearchFilter } from "@/components/SearchFilter";
import { BlogCard } from "./blog-card";
import { Pagination } from "./pagination";

export default function ClientSideSearch({ initialBlogs, initialPagination }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState(initialBlogs);
  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage);
  const BLOGS_PER_PAGE = 9;

  // Filter blogs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBlogs(initialBlogs);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = initialBlogs.filter((blog) => {
      return (
        blog.title.toLowerCase().includes(lowerCaseQuery) ||
        blog.content.toLowerCase().includes(lowerCaseQuery) ||
        (blog.tags &&
          blog.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)))
      );
    });

    setFilteredBlogs(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, initialBlogs]);

  // Calculate pagination for client-side filtered results
  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
    const endIndex = startIndex + BLOGS_PER_PAGE;
    return filteredBlogs.slice(startIndex, endIndex);
  }, [filteredBlogs, currentPage]);

  // Calculate pagination metadata for client-side filtered results
  const pagination = useMemo(() => {
    return {
      currentPage,
      totalPages: Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE),
      totalBlogs: filteredBlogs.length,
    };
  }, [filteredBlogs, currentPage]);

  // Handle page change directly on client
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <SearchFilter
          onSearch={setSearchQuery}
          placeholder="Search blogs by title, content, or tags..."
          initialValue={searchQuery}
        />
      </div>

      {paginatedBlogs.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No blogs found</h2>
          <p className="text-gray-500 mt-3">
            Try changing your search criteria
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {paginatedBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
