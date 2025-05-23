"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/main-layout";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import img from "next/img";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ArrowRight,
  Tag,
} from "lucide-react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch upcoming events
        const eventsResponse = await fetch(
          "/api/events?status=upcoming&limit=4&sort=startDate"
        );
        const eventsData = await eventsResponse.json();

        // Fetch recent blogs
        const blogsResponse = await fetch(
          "/api/admin/blogs?status=published&limit=3&sort=createdAt"
        );
        const blogsData = await blogsResponse.json();

        setUpcomingEvents(eventsData);
        setRecentBlogs(Array.isArray(blogsData) ? blogsData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time from date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const showSession = () => {
    if (status === "authenticated") {
      return (
        <button
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          onClick={() => {
            signOut({ redirect: false }).then(() => {
              router.push("/");
            });
          }}
        >
          Sign Out
        </button>
      );
    } else if (status === "loading") {
      return <span className="text-[#888] text-sm mt-7">Loading...</span>;
    } else {
      return (
        <Link
          href="/login"
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Sign In
        </Link>
      );
    }
  };

  return (
    <MainLayout>
      <div className="flex bg-white px-4 md:px-20">
        <div className="flex items-center text-center lg:text-left px-0 md:px-12 lg:w-1/2">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800 md:text-4xl">
              Welcome to{" "}
              <span className="text-indigo-600">Ceylon Sports Club!</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500 md:text-base">
              Ceylon Sports Club is a vibrant community hub founded by Sri
              Lankan sports enthusiasts in Canada. We celebrate our heritage
              while embracing Canadian multiculturalism through sports, bringing
              people together to enjoy cricket, badminton, volleyball, football,
              and more.
            </p>
            <p className="mt-4 text-sm text-gray-500 md:text-base">
              Established in 2010, our club has grown into a premier destination
              for sports lovers of all ages and skill levels. We host regular
              tournaments, training sessions, and cultural events that blend Sri
              Lankan traditions with Canadian values of teamwork and
              sportsmanship.
            </p>
            <p className="mt-4 text-sm font-bold text-gray-800 md:text-base">
              Join our growing community and experience the perfect blend of
              competitive sports, cultural connection, and lasting friendships.
            </p>
            <div className="flex justify-center lg:justify-start mt-6">
              <Link
                href="/contact"
                className="px-4 py-3 bg-gray-900 text-gray-200 text-xs font-semibold rounded hover:bg-gray-800"
              >
                Become a Member
              </Link>
              <Link
                href="/events"
                className="mx-4 px-4 py-3 bg-gray-300 text-gray-900 text-xs font-semibold rounded hover:bg-gray-400"
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
        <div
          className="hidden lg:block lg:w-1/2"
          style={{ clipPath: "polygon(10% 0, 100% 0%, 100% 100%, 0 100%)" }}
        >
          <img
            src="/new_logo.svg"
            alt="Ceylon Sports Club Team"
            className="pl-40 object-cover m-10"
            style={{ filter: "invert(1)" }}
          />
        </div>
      </div>

      {/* Featured Upcoming Event Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Featured Event
            </h2>
            <Link
              href="/events"
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View all events <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          ) : upcomingEvents.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-2/5 relative h-64 md:h-auto">
                  <img
                    src={upcomingEvents[0].imageUrl || "/new_logo.svg"}
                    alt={upcomingEvents[0].name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-500 text-white">
                      Upcoming Event
                    </Badge>
                  </div>
                </div>
                <div className="p-6 md:p-8 md:w-3/5">
                  {upcomingEvents[0].sport && (
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mb-3">
                      {upcomingEvents[0].sport.name}
                    </span>
                  )}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    {upcomingEvents[0].name}
                  </h3>
                  <div className="text-gray-600 space-y-3 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                      <span>{formatDate(upcomingEvents[0].startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                      <span>{formatTime(upcomingEvents[0].startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
                      <span>{upcomingEvents[0].location}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 line-clamp-2">
                    {upcomingEvents[0].description.replace(/<[^>]*>/g, "")}
                  </p>
                  <Link href={`/event/${upcomingEvents[0].slug}`}>
                    <Button>
                      View Event Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {upcomingEvents.length > 1 && (
                <div className="border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  {upcomingEvents.slice(1, 4).map((event, index) => (
                    <Link
                      key={event._id}
                      href={`/event/${event.slug}`}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0 mr-4">
                        <img
                          src={event.imageUrl || "/new_logo.svg"}
                          alt={event.name}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {event.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(event.startDate)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-700">
                No upcoming events
              </h3>
              <p className="text-gray-500 mt-2">
                Check back soon for new events!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Blog Posts Section */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Latest Articles
            </h2>
            <Link
              href="/blogs"
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View all articles <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-96 bg-gray-100 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : recentBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentBlogs.slice(1,4).map((blog) => (
                <Card
                  key={blog._id}
                  className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  {blog.img && (
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="aspect-video w-full overflow-hidden relative"
                    >
                      <img
                        src={blog.img}
                        alt={blog.title}
                        className="object-cover transition-transform hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
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

                    <Link
                      href={`/blog/${blog.slug}`}
                      className="hover:underline"
                    >
                      <h2 className="text-xl font-bold line-clamp-2 mb-2">
                        {blog.title}
                      </h2>
                    </Link>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formatDate(blog.createdAt)}
                    </div>

                    <p className="text-gray-600 line-clamp-3">
                      {blog.content.replace(/<[^>]*>/g, "")}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/blog/${blog.slug}`}
                      passHref
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full group">
                        Read More
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-700">
                No blog posts available
              </h3>
              <p className="text-gray-500 mt-2">
                Check back soon for new articles!
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
