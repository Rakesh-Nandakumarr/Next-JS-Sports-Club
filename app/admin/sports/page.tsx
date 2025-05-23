"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon, CirclePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";

// Define the Sport type
interface Sport {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  formConfig?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();

  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportToDelete, setSportToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/sports");
      if (!response.ok) {
        throw new Error("Failed to fetch sports");
      }
      const data = await response.json();
      setSports(data);
    } catch (error) {
      console.error("Error fetching sports:", error);
      toast({
        title: "Error",
        description: "Failed to load sports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="w-full">
          <SiteHeader title="Sports" />
          <div className="container flex flex-col gap-4 py-6">
            <div className="flex justify-center py-10">Loading sports...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const columns: ColumnDef<Sport>[] = [
    {
      accessorKey: "_id",
      header: "#",
      cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const createdAt = new Date(row.getValue("createdAt"));
        return (
          <div className="font-medium">{createdAt.toLocaleDateString()}</div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      enableSorting: false, // Disable sorting
      searchable: false, // Disable searching
      exportToExcel: false, // Exclude from Excel
      exportToPdf: false,
      cell: ({ row }) => {
        const sport = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 p-0">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => router.push(`/admin/sports/${sport._id}`)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSportToDelete(sport._id)}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/sport/${sport.slug}`)}
              >
                View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const handleDeleteSport = async () => {
    if (!sportToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/sports?id=${sportToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sport");
      }

      setSports((prevSports) =>
        prevSports.filter((sport) => sport._id !== sportToDelete)
      );
      toast({
        title: "Sport deleted",
        description: "The sport has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the sport. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting sport:", error);
    } finally {
      setSportToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Sports" />
        <div className="container flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-4 px-5">
            <div className="flex justify-end">
              <a href="/admin/sports/create">
                <Button className="w-full px-6" variant="outline" size="icon">
                  <CirclePlus />
                  Create Sport
                </Button>
              </a>
            </div>
            <DataTable columns={columns} data={sports} />
          </div>
        </div>
      </SidebarInset>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!sportToDelete}
        onOpenChange={(open) => !open && setSportToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              sport and all related data like teams, players, and events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteSport();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
