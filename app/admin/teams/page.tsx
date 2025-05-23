"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
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
import { ColumnDef } from "@tanstack/react-table";
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

interface Team {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  coach: string;
  slug: string;
  sport: {
    _id: string;
    name: string;
  };
}

export default function TeamsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/teams");
      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/teams?id=${teamToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete team");
      }

      setTeams((prevTeams) =>
        prevTeams.filter((team) => team._id !== teamToDelete)
      );
      toast({
        title: "Team deleted",
        description: "The team has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the team. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting team:", error);
    } finally {
      setTeamToDelete(null);
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Team>[] = [
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
      accessorKey: "coach",
      header: "Coach",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("coach")}</div>
      ),
    },
    {
      accessorKey: "sport",
      header: "Sport",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.sport?.name}</div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const team = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 p-0">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => router.push(`/admin/teams/${team._id}`)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTeamToDelete(team._id)}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/team/${team.slug}`)}
              >
                View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="w-full">
          <SiteHeader title="Teams" />
          <div className="container flex flex-col gap-4 py-6">
            <div className="flex justify-center py-10">Loading teams...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Teams" />
        <div className="container flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-4 px-5">
            <div className="flex justify-end">
              <a href="/admin/teams/create">
                <Button className="w-full px-6" variant="outline" size="icon">
                  <CirclePlus />
                  Create Team
                </Button>
              </a>
            </div>
            <DataTable columns={columns} data={teams} />
          </div>
        </div>
      </SidebarInset>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!teamToDelete}
        onOpenChange={(open) => !open && setTeamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              team and potentially affect related players and events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteTeam();
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
