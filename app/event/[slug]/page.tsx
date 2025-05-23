import React from "react";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format, parseISO, isAfter, isBefore, isToday } from "date-fns";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SocialShareButtons,
  ViewOnMapButton,
} from "@/components/EventInteractiveButtons";
import {
  Calendar,
  MapPin,
  Clock,
  Share2,
  ChevronLeft,
  Trophy,
  Users,
  CalendarClock,
  InfoIcon,
} from "lucide-react";

type Props = {
  params: { slug: string };
};

// Generate dynamic metadata for SEO
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return {
      title: "Event not found",
      description: "The requested event could not be found.",
    };
  }

  // Calculate event status text
  const eventStatus = getEventStatusText(event.status);

  // Format dates for description
  const startDate = format(parseISO(event.startDate), "MMMM d, yyyy");
  const endDate = format(parseISO(event.endDate), "MMMM d, yyyy");

  // Create a clean description
  const description = `${eventStatus} event: ${event.name} at ${
    event.location
  }. ${startDate} ${startDate !== endDate ? `to ${endDate}` : ""}`;
  return {
    title: `${event.name} - Event Details`,
    description,
    openGraph: {
      title: `${event.name} - Event Details`,
      description,
      images: event.imageUrl ? [{ url: event.imageUrl }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description,
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
  };
}

// Function to get event by slug
async function getEventBySlug(slug: string) {
  try {
    await connectDB();
    const event = await Event.findOne({ slug })
      .populate("sport")
      .populate("teams")
      .lean();

    if (!event) return null;

    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

// Function to get related events based on sport or teams
async function getRelatedEvents(event: any, limit = 3) {
  try {
    await connectDB();

    let query = {
      _id: { $ne: event._id }, // Exclude current event
      $or: [] as any[],
    };

    // Add sport-based criteria if available
    if (event.sport) {
      query.$or.push({ sport: event.sport._id });
    }

    // Add team-based criteria if available
    if (event.teams && event.teams.length > 0) {
      const teamIds = event.teams.map((team: any) => team._id);
      query.$or.push({ teams: { $in: teamIds } });
    }

    // If no related criteria, just get other events
    if (query.$or.length === 0) {
      delete query.$or;
    }

    const relatedEvents = await Event.find(query)
      .populate("sport")
      .sort({ startDate: 1 })
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(relatedEvents));
  } catch (error) {
    console.error("Error fetching related events:", error);
    return [];
  }
}

// Helper function to get formatted event status text
function getEventStatusText(status: string): string {
  switch (status) {
    case "upcoming":
      return "Upcoming";
    case "ongoing":
      return "Happening Now";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

// Helper function to get event time status
function getEventTimeStatus(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isAfter(now, end)) {
    return "This event has ended";
  } else if (isBefore(now, start)) {
    if (isToday(start)) {
      const hours = start.getHours().toString().padStart(2, "0");
      const minutes = start.getMinutes().toString().padStart(2, "0");
      return `Starting today at ${hours}:${minutes}`;
    } else {
      const daysUntil = Math.ceil(
        (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `Starting in ${daysUntil} ${daysUntil === 1 ? "day" : "days"}`;
    }
  } else {
    if (isToday(end)) {
      const hours = end.getHours().toString().padStart(2, "0");
      const minutes = end.getMinutes().toString().padStart(2, "0");
      return `Ending today at ${hours}:${minutes}`;
    } else {
      const daysRemaining = Math.ceil(
        (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `${daysRemaining} ${
        daysRemaining === 1 ? "day" : "days"
      } remaining`;
    }
  }
}

// Helper function to format dates for display
function formatEventDates(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // Same day event
  if (format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
    return `${format(start, "EEEE, MMMM d, yyyy")} • ${format(
      start,
      "h:mm a"
    )} - ${format(end, "h:mm a")}`;
  }

  // Multi-day event
  return `${format(start, "EEE, MMM d, yyyy")} - ${format(
    end,
    "EEE, MMM d, yyyy"
  )}`;
}

export default async function EventPage({ params }: Props) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const relatedEvents = await getRelatedEvents(event);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <div className="relative bg-black">
        <div className="absolute inset-0 z-0 opacity-60">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-20">
          <Link
            href="/events"
            className="inline-flex items-center text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Link>

          <div className="max-w-4xl text-white">
            <div className="flex flex-wrap gap-2 mb-4">
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
                {getEventStatusText(event.status)}
              </Badge>

              {event.sport && (
                <Badge variant="outline" className="border-white/60 text-white">
                  {event.sport.name}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {event.name}
            </h1>

            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 space-y-3 max-w-2xl">
              <div className="flex items-center text-white/90">
                <Calendar className="h-5 w-5 mr-3" />
                <span>{formatEventDates(event.startDate, event.endDate)}</span>
              </div>

              <div className="flex items-center text-white/90">
                <MapPin className="h-5 w-5 mr-3" />
                <span>{event.location}</span>
              </div>

              <div className="flex items-center text-white/90">
                <Clock className="h-5 w-5 mr-3" />
                <span>
                  {getEventTimeStatus(event.startDate, event.endDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </Card>

            {event.teams && event.teams.length > 0 && (
              <Card className="p-6 mb-8">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 mr-2 text-primary" />
                  <h2 className="text-2xl font-bold">Participating Teams</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.teams.map((team: any) => (
                    <Link
                      key={team._id}
                      href={`/team/${team.slug}`}
                      className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {team.logoUrl ? (
                        <div className="w-12 h-12 mr-4 rounded-full overflow-hidden">
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 mr-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {team.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{team.name}</h3>
                        {team.location && (
                          <p className="text-sm text-muted-foreground">
                            {team.location}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <InfoIcon className="h-6 w-6 mr-2 text-primary" />
                <h2 className="text-2xl font-bold">Event Details</h2>
              </div>

              <dl className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <dt className="font-semibold text-muted-foreground flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Start Date
                  </dt>
                  <dd className="md:col-span-2">
                    {format(
                      parseISO(event.startDate),
                      "EEEE, MMMM d, yyyy, h:mm a"
                    )}
                  </dd>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <dt className="font-semibold text-muted-foreground flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2" />
                    End Date
                  </dt>
                  <dd className="md:col-span-2">
                    {format(
                      parseISO(event.endDate),
                      "EEEE, MMMM d, yyyy, h:mm a"
                    )}
                  </dd>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <dt className="font-semibold text-muted-foreground flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </dt>
                  <dd className="md:col-span-2">{event.location}</dd>
                </div>
                {event.sport && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <dt className="font-semibold text-muted-foreground flex items-center">
                        <Trophy className="h-4 w-4 mr-2" />
                        Sport
                      </dt>
                      <dd className="md:col-span-2">
                        <Link
                          href={`/sport/${event.sport.slug}`}
                          className="text-primary hover:underline"
                        >
                          {event.sport.name}
                        </Link>
                      </dd>
                    </div>
                  </>
                )}
                <Separator />{" "}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <dt className="font-semibold text-muted-foreground flex items-center">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </dt>
                  <dd className="md:col-span-2">
                    <SocialShareButtons
                      eventName={event.name}
                      currentUrl={
                        typeof window !== "undefined"
                          ? window.location.href
                          : ""
                      }
                    />
                  </dd>
                </div>
              </dl>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 sticky top-4">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-xl font-bold">Event Schedule</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {formatEventDates(event.startDate, event.endDate)}
                </p>
                <div className="bg-primary/10 rounded-lg p-4 text-sm">
                  <p className="font-medium">
                    {getEventTimeStatus(event.startDate, event.endDate)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-xl font-bold">Location</h2>
                </div>
                <p className="text-sm mb-4">{event.location}</p>
                {/* <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${encodeURIComponent(
                        event.location
                      )}`,
                      "_blank"
                    )
                  }
                >
                  View on Map
                </Button> */}
              </div>

              {relatedEvents.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <h2 className="text-xl font-bold">Related Events</h2>
                  </div>
                  <div className="space-y-3">
                    {relatedEvents.map((relEvent: any) => (
                      <Link
                        key={relEvent._id}
                        href={`/event/${relEvent.slug}`}
                        className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-12 w-12 relative rounded-md overflow-hidden mr-3">
                          <img
                            src={relEvent.imageUrl}
                            alt={relEvent.name}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-1">
                            {relEvent.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              parseISO(relEvent.startDate),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
