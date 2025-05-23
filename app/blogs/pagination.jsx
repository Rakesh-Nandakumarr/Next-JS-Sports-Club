"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ pagination, onPageChange }) {
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
          onClick={() => onPageChange(currentPage - 1)}
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
              onClick={() => onPageChange(page)}
              active={page === currentPage}
            >
              {page}
            </PaginationButton>
          );
        })}

        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
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
  active = false,
  disabled = false,
  onClick,
}) {
  const className = `
    flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer
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
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
