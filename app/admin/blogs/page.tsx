"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CirclePlus } from "lucide-react";

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  img?: string;
  tags?: string[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blogs`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }
      const data = await response.json();
      setBlogs(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch blogs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blogs?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the blog");
      }

      toast({
        title: "Success",
        description: "Blog deleted successfully",
      });

      // Refresh the blog list
      fetchBlogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the blog",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<BlogItem>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "published" ? "default" : "secondary"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push(`/blog/${row.original.slug}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push(`/admin/blogs/edit/${row.original._id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDelete(row.original._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Blog Management" />

        <div className="container py-6 px-5">
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => router.push("/admin/blogs/create")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CirclePlus className="w-4 h-4" />
              Create New Blog
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">Loading blogs...</div>
          ) : (
            <DataTable
              columns={columns}
              data={blogs}
              exportFileName="blogs-export"
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
