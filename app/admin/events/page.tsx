"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { useRouter } from "next/navigation";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { CirclePlus } from "lucide-react";

interface Event {
  _id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  capacity: number;
  registeredParticipants: number;
  sport?: { name: string; slug: string };
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await fetch(`/api/admin/events?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete event");
        }

        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        fetchEvents();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
        });
        console.error(error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "ongoing":
        return <Badge className="bg-green-500">Ongoing</Badge>;
      case "completed":
        return <Badge className="bg-gray-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        return new Date(row.original.startDate).toLocaleDateString();
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return getStatusBadge(row.original.status);
      },
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => {
        return `${row.original.registeredParticipants}/${row.original.capacity}`;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Link href={`/admin/events/${row.original._id}`}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(row.original._id)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Events Management" />
        <div className="container mx-auto p-4">
          <div className="flex justify-end items-center mb-6">
            <Link href="/admin/events/new">
              <Button className="w-full px-6" variant="outline" size="icon">
              <CirclePlus />Create New Event</Button>
            </Link>
          </div>

          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p>No events found. Create your first event!</p>
          ) : (
            <DataTable
              columns={columns}
              data={events}
              exportFileName="Events List"
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
