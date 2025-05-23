import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface BlogFormProps {
  initialData?: {
    _id?: string;
    title: string;
    content: string;
    slug?: string;
    tags?: string[];
    img?: string;
    status: "draft" | "published";
  };
  loading?: boolean;
  onSubmit: (data: any) => void;
}

export function BlogForm({
  initialData,
  loading = false,
  onSubmit,
}: BlogFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    tags: "",
    img: "",
    status: "draft",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(
    null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        content: initialData.content || "",
        tags: initialData.tags ? initialData.tags.join(", ") : "",
        img: initialData.img || initialData.image || "",
        status: initialData.status || "draft",
      });
    }
  }, [initialData]);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug when title changes
    if (name === "title") {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");

      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setLocalImagePreview(null);
      return;
    }

    const file = e.target.files[0];
    setSelectedFile(file);

    // Create a local preview of the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    try {
      // First upload the image if a new one was selected
      let imageUrl = formData.img;

      if (selectedFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", selectedFile);

        console.log("Uploading image...");
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          const errorMessage = errorData.error || "Failed to upload image";
          setUploadError(errorMessage);
          throw new Error(errorMessage);
        }

        const uploadData = await uploadResponse.json();
        if (!uploadData.imageUrl) {
          const errorMessage = "Failed to get image URL from server";
          setUploadError(errorMessage);
          throw new Error(errorMessage);
        }

        imageUrl = uploadData.imageUrl;
        console.log("Image uploaded successfully:", imageUrl);
      } else if (!initialData?.img && !imageUrl) {
        // If no image is provided, show a message but don't block submission
        console.warn("No image provided for blog post");
      }

      // Convert tags string to array
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim())
        : [];

      // Ensure slug is properly set
      if (!formData.slug) {
        const generatedSlug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-");

        setFormData((prev) => ({ ...prev, slug: generatedSlug }));
      } // Prepare data for submission with the uploaded image URL
      const blogData = {
        ...formData,
        img: imageUrl,
        tags: tagsArray,
      };

      console.log("Submitting blog data:", blogData);
      // Call the onSubmit handler from parent component
      onSubmit(blogData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process the blog",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  return (
    <Card className="mx-5">
      <CardHeader>
        <CardTitle>Create New Blog</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter blog title"
            />
          </div>{" "}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (auto-generated)</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="auto-generated-from-title"
                className="flex-1"
                readOnly
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center">
              <Info className="h-4 w-4 mr-1" />
              The slug is automatically generated from the title
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Enter blog content"
              className="min-h-[200px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. sports, news, updates"
            />
          </div>{" "}
          <div className="space-y-2">
            <Label htmlFor="image">Featured Image</Label>
            <div className="mt-2">
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="max-w-full"
              />
              {uploadError && (
                <p className="text-sm text-red-500 mt-1">
                  Error: {uploadError}
                </p>
              )}
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {selectedFile.name} (
                  {Math.round(selectedFile.size / 1024)} KB) - Will upload on
                  save
                </p>
              )}
            </div>{" "}
            {/* Show either the local preview or the existing image */}
            {(localImagePreview || formData.img) && (
              <div className="mt-4 border rounded-md p-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {localImagePreview
                    ? "Selected Image Preview:"
                    : "Current Image:"}
                </p>
                <div className="relative h-40 w-full">
                  <Image
                    src={localImagePreview || formData.img}
                    alt="Preview"
                    fill
                    className="object-contain rounded-md"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : initialData?._id ? (
              "Update Blog"
            ) : (
              "Create Blog"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
