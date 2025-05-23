import React from "react";
import Link from "next/link";
import img from "next/img";
import { Metadata } from "next";
import { format, isSameDay } from "date-fns";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Sport from "@/models/Sport";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, ChevronRight, Clock } from "lucide-react";
import MainLayout from "@/app/main-layout";


export const dynamic = "force-dynamic"; // Disable static rendering for fresh data

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Sports Events | Upcoming Tournaments and Matches",
  description:
    "Browse our upcoming sports events, tournaments, and matches. Find event details including dates, locations, and participating teams.",
  openGraph: {
    title: "Sports Events | Upcoming Tournaments and Matches",
    description:
      "Browse our upcoming sports events, tournaments, and matches. Find event details including dates, locations, and participating teams.",
    type: "website",
  },
};

// Function to get events by status
async function getEvents(status?: string) {
  try {
    await connectDB();

    let query = {};

    if (status) {
      query = { status };
    }

    const events = await Event.find(query)
      .populate("sport")
      .populate("teams")
      .sort({ startDate: status === "completed" ? -1 : 1 })
      .lean();

    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Function to get all sports
async function getSports() {
  try {
    await connectDB();
    const sports = await Sport.find().sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(sports));
  } catch (error) {
    console.error("Error fetching sports:", error);
    return [];
  }
}

// Function to format date range
function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isSameDay(start, end)) {
    return format(start, "MMMM d, yyyy");
  }

  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${format(start, "MMMM d")} - ${format(end, "d, yyyy")}`;
  }

  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
}

export default async function EventsPage() {
  const [upcomingEvents, ongoingEvents, completedEvents, sports] =
    await Promise.all([
      getEvents("upcoming"),
      getEvents("ongoing"),
      getEvents("completed"),
      getSports(),
    ]);

  const featuredEvent = [...ongoingEvents, ...upcomingEvents][0];

  return (
    <MainLayout>
    <div className="min-h-screen bg-background">
      {/* Hero Section with Featured Event */}
      {featuredEvent ? (
        <div className="relative bg-black">
          <div className="absolute inset-0 z-0 opacity-50">
            {" "}
            <img
              src={
                featuredEvent.imageUrl.startsWith("http")
                  ? featuredEvent.imageUrl
                  : featuredEvent.imageUrl.startsWith("/")
                  ? featuredEvent.imageUrl
                  : `/${featuredEvent.imageUrl}`
              }
              alt={featuredEvent.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative z-10 container mx-auto px-4 py-24">
            <div className="max-w-3xl text-white">
              <div className="mb-4">
                <Badge
                  className={
                    featuredEvent.status === "ongoing"
                      ? "bg-green-500"
                      : "bg-primary"
                  }
                >
                  {featuredEvent.status === "ongoing"
                    ? "Live Now"
                    : "Featured Event"}
                </Badge>
                {featuredEvent.sport && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-white border-white"
                  >
                    {featuredEvent.sport.name}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {featuredEvent.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 text-gray-200">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {formatDateRange(
                    featuredEvent.startDate,
                    featuredEvent.endDate
                  )}
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {featuredEvent.location}
                </div>
              </div>
              <Link href={`/event/${featuredEvent.slug}`}>
                <Button size="lg" className="gap-2 group">
                  View Details
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sports Events
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Browse upcoming tournaments, matches, and competitions
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Ongoing Events */}
        {ongoingEvents.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold">Live Events</h2>
                <p className="text-muted-foreground mt-1">
                  Events happening right now
                </p>
              </div>
              {ongoingEvents.length > 3 && (
                <Link href="/events/ongoing">
                  <Button variant="ghost" className="gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingEvents.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Upcoming Events</h2>
              <p className="text-muted-foreground mt-1">
                Events scheduled for the future
              </p>
            </div>
            {upcomingEvents.length > 6 && (
              <Link href="/events/upcoming">
                <Button variant="ghost" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/30">
              <p className="text-lg text-muted-foreground">
                No upcoming events scheduled at the moment
              </p>
              <p className="text-sm mt-1">Check back soon for new events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.slice(0, 6).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Past Events</h2>
              <p className="text-muted-foreground mt-1">
                Completed events and results
              </p>
            </div>
            {completedEvents.length > 3 && (
              <Link href="/events/completed">
                <Button variant="ghost" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          {completedEvents.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/30">
              <p className="text-lg text-muted-foreground">
                No completed events yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEvents.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Browse by Sport Section */}
        {sports.length > 0 && (
          <section className="mt-16 pt-16 border-t">
            <h2 className="text-3xl font-bold mb-8">Browse Events by Sport</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sports.map((sport) => (
                <Link
                  key={sport._id}
                  href={`/sport/${sport.slug}`}
                  className="group flex flex-col items-center p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {" "}
                  {sport.imageUrl ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                      {" "}
                      <img
                        src={
                          sport.imageUrl.startsWith("http")
                            ? sport.imageUrl
                            : sport.imageUrl.startsWith("/")
                            ? sport.imageUrl
                            : `/${sport.imageUrl}`
                        }
                        alt={sport.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                      <span className="text-lg font-bold">
                        {sport.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-center font-medium group-hover:text-primary transition-colors">
                    {sport.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      </div>
    </MainLayout>
  );
}

// Event Card Component
function EventCard({ event }: { event: any }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      {" "}
      <Link
        href={`/event/${event.slug}`}
        className="aspect-video relative block"
      >
        <div className="relative w-full h-full">
          {" "}
          <img
            src={
              event.imageUrl.startsWith("http")
                ? event.imageUrl
                : event.imageUrl.startsWith("/")
                ? event.imageUrl
                : `/${event.imageUrl}`
            }
            alt={event.name}
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2">
            <Badge
              className={
                event.status === "upcoming"
                  ? "bg-blue-500"
                  : event.status === "ongoing"
                  ? "bg-green-500"
                  : event.status === "completed"
                  ? "bg-gray-500"
                  : "bg-red-500"
              }
            >
              {event.status === "upcoming"
                ? "Upcoming"
                : event.status === "ongoing"
                ? "Live Now"
                : event.status === "completed"
                ? "Completed"
                : "Cancelled"}
            </Badge>
          </div>
        </div>
      </Link>
      <CardContent className="flex-grow p-5">
        <div className="mb-3">
          {event.sport && (
            <Badge variant="outline" className="mb-2">
              {event.sport.name}
            </Badge>
          )}
          <Link href={`/event/${event.slug}`} className="hover:underline">
            <h3 className="font-bold text-xl mb-2 line-clamp-2">
              {event.name}
            </h3>
          </Link>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
          </div>

          {event.status === "upcoming" && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <TimeUntilEvent startDate={event.startDate} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Link href={`/event/${event.slug}`} className="w-full">
          <Button
            variant={event.status === "ongoing" ? "default" : "outline"}
            className="w-full group"
          >
            View Details
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Time until event component
function TimeUntilEvent({ startDate }: { startDate: string }) {
  const eventDate = new Date(startDate);
  const currentDate = new Date();
  const diffTime = eventDate.getTime() - currentDate.getTime();

  if (diffTime <= 0) return <span>Event started</span>;

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 30) {
    const diffMonths = Math.floor(diffDays / 30);
    return (
      <span>
        In {diffMonths} {diffMonths === 1 ? "month" : "months"}
      </span>
    );
  }

  if (diffDays > 0) {
    return (
      <span>
        In {diffDays} {diffDays === 1 ? "day" : "days"}
      </span>
    );
  }

  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

  if (diffHours > 0) {
    return (
      <span>
        In {diffHours} {diffHours === 1 ? "hour" : "hours"}
      </span>
    );
  }

  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  return (
    <span>
      In {diffMinutes} {diffMinutes === 1 ? "minute" : "minutes"}
    </span>
  );
}
