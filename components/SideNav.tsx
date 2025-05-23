"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SideNav() {
  const [sports, setSports] = useState([]);

  useEffect(() => {
    async function fetchSports() {
      try {
        const response = await fetch("/api/admin/sports");
        if (!response.ok) {
          throw new Error("Failed to fetch sports");
        }
        const data = await response.json();
        if (data.length === 0) {
          console.warn("No sports data available");
          setSports([]);
        }
        setSports(data);
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    }

    fetchSports();
  }, []);

  return (
    <nav
      id="mobile-nav"
      className="flex-col flex-grow hidden pb-4 md:pb-0 md:flex md:justify-end md:flex-row p-4"
    >
      <Link
        href="/about-us"
        className="px-4 py-2 mt-2 text-sm font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
      >
        About Us
      </Link>
      <Link
        href="/events"
        className="px-4 py-2 mt-2 text-sm font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
      >
        Events
      </Link>
      <Link
        href="/blogs"
        className="px-4 py-2 mt-2 text-sm font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
      >
        Blogs
      </Link>
      <div className="ml-3 relative">
        <div className="inline-flex rounded-md">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 mt-2 text-sm font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
            onClick={() => {
              const dropdown = document.getElementById("sports-dropdown");
              if (dropdown) dropdown.classList.toggle("hidden");
            }}
          >
            Sports
            <svg
              className="ml-2 -mr-0.5 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        </div>
        <div
          id="sports-dropdown"
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden z-30"
        >
          <ul className="py-1 text-sm text-gray-700">
            {sports.map((sport) => (
              <li key={sport._id}>
                <Link
                  href={`/sport/${sport.name.toLowerCase().replace(/ /g, "_")}`}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  {sport.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link
        href="/contact"
        className="px-4 py-2 mt-2 text-sm font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
      >
        Contact
      </Link>
    </nav>
  );
}
