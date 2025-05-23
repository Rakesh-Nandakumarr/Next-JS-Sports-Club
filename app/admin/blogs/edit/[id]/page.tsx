"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { BlogForm } from "@/components/BlogForm";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditBlogPage({ params }: PageProps) {
  const { id } = params;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/admin/blogs?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch blog");
        }
        const data = await response.json();
        setBlog(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch blog",
          variant: "destructive",
        });
        router.push("/admin/blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/blogs?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update blog");
      }

      toast({
        title: "Success",
        description: "Blog updated successfully",
      });

      router.push("/admin/blogs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update blog",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="w-full">
          <SiteHeader title="Edit Blog" />
          <div className="container py-6 flex justify-center items-center">
            <div>Loading blog data...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Edit Blog" />
        <div className="container py-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/blogs")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Blogs
            </Button>
          </div>

          <div className="space-y-6">
            {blog && (
              <BlogForm
                onSubmit={handleSubmit}
                loading={submitting}
                initialData={blog}
              />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
