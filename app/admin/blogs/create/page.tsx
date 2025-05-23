"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { BlogForm } from "@/components/BlogForm";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateBlogPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create blog");
      }

      toast({
        title: "Success",
        description: "Blog created successfully",
      });

      router.push("/admin/blogs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Create Blog" />
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

          <BlogForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
