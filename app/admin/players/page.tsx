"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import React, { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVerticalIcon, CirclePlus, Loader2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"

interface Player {
  _id: string;
  name: string;
  description?: string;
  age: number;
  imageUrl: string;
  contact: string;
  slug: string;
  team?: {
    _id: string;
    name: string;
    coach?: string;
    slug: string;
  };
  sport?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/players");
      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load players. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/players?id=${playerToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete player");
      }

      setPlayers((prevPlayers) => prevPlayers.filter((player) => player._id !== playerToDelete));
      toast({
        title: "Player deleted",
        description: "The player has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the player. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting player:", error);
    } finally {
      setPlayerToDelete(null);
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Player>[] = [
    //count
    {
      accessorKey: "_id",
      header: "#",
      cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    { 
      accessorKey: "name", 
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "age", 
      header: "Age",
      cell: ({ row }) => <div className="font-medium">{row.getValue("age")}</div>,
    },
    {
      accessorKey: "contact", 
      header: "Contact",
      cell: ({ row }) => <div className="font-medium">{row.getValue("contact")}</div>,
    },
    {
      accessorKey: "team", 
      header: "Team",
      cell: ({ row }) => <div className="font-medium">{row.original.team?.name}</div>,
    },
    // sport
    {
      accessorKey: "sport",
      header: "Sport",
      cell: ({ row }) => <div className="font-medium">{row.original.sport?.name}</div>,
    },    //coach
    {
      accessorKey: "coach",
      header: "Coach Name",
      cell: ({ row }) => <div className="font-medium">{row.original.team?.coach || "N/A"}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 p-0">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/admin/players/${row.original._id}`)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setPlayerToDelete(row.original._id)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/player/${row.original.slug}`, '_blank')}>
              View Public Page
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Players" />
        <div className="container flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-4 px-5">
            <div className="flex justify-end">
              <Button
                onClick={() => router.push("/admin/players/create")}
                className="flex items-center gap-2"
                variant="outline"
              >
                <CirclePlus className="h-4 w-4" />
                Create Player
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DataTable columns={columns} data={players} />
            )}
          </div>
        </div>
      </SidebarInset>

      <AlertDialog
        open={!!playerToDelete}
        onOpenChange={(open) => !open && setPlayerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              player and may affect related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
