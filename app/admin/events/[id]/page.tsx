"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EventForm from "@/components/EventForm";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface EventData {
  _id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  sport?: string;
  teams?: string[];
  capacity: number;
  registeredParticipants: number;
  imageUrl: string;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/events?eventId=${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          // Convert string dates to Date objects for the form
          const eventData = {
            ...data[0],
            startDate: new Date(data[0].startDate),
            endDate: new Date(data[0].endDate),
          };

          setEvent(eventData);
        } else {
          toast({
            title: "Error",
            description: "Event not found",
            variant: "destructive",
          });
          router.push("/admin/events");
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, router, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Edit Event</h1>
        <Card>
          <CardContent className="p-6">
            <p>Loading event data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Edit Event</h1>
        <Card>
          <CardContent className="p-6">
            <p>Event not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Edit Event" />
        <div className="container mx-auto p-4">
          <Card className="container px-5 py-6">
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <EventForm initialData={event} isEditing={true} />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
