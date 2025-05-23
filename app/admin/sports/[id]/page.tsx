"use client"

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Upload, Save } from "lucide-react";
import FormBuilder, { FormField } from "@/components/dynamic-components/form-builder";

const MAX_FILE_SIZE_MB = 5;
const RECOMMENDED_IMAGE_SIZE = "800x600px";

interface SportData {
  name: string;
  description: string;
  imageFile: File | null;
  previewImage: string;
}

const startingSportData: SportData = {
  name: "",
  description: "",
  imageFile: null,
  previewImage: "",
};

export default function SportCreationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [sportData, setSportData] = useState<SportData>(startingSportData);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSportData((prev) => ({ ...prev, [name]: value }));
    validateForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload a valid image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({
        title: "Error",
        description: `File must be smaller than ${MAX_FILE_SIZE_MB}MB.`,
        variant: "destructive",
      });
      return;
    }

    setSportData((prev) => ({
      ...prev,
      imageFile: file,
      previewImage: URL.createObjectURL(file),
    }));
    validateForm();
  };

  const validateForm = () => {
    const isValid = (
      sportData.name.trim() !== "" &&
      sportData.description.trim() !== ""
    );
    setIsFormValid(isValid);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!isFormValid) {
      toast({
        title: "Error",
        description: "Please fill all required fields and upload an image.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // First upload the image
      const imageFormData = new FormData();
      imageFormData.append("file", sportData.imageFile as File);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: imageFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error(uploadResponse.statusText || "Failed to upload image");
      }

      const { imageUrl } = await uploadResponse.json();

      // Then create the sport with all data
      const response = await fetch("/api/admin/sports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sportData.name,
          description: sportData.description,
          imageUrl,
          formConfig: formFields,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create sport");
      }

      toast({
        title: "Success",
        description: "Sport created successfully with form configuration.",
      });

      // Reset form
      setSportData(startingSportData);
      setFormFields([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Redirect with success state
      router.push(`/admin/sports?success=true`);
    } catch (error) {
      console.error("Error creating sport:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Create New Sport" />
        <div className="container py-6 max-w-4xl mx-auto">
          <form ref={formRef} onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Sport Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Sport Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. Football, Basketball"
                    value={sportData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the sport..."
                    value={sportData.description}
                    onChange={handleChange}
                    rows={4}
                    className="min-h-[120px]"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Describe the rules, equipment, and relevant details.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Sport Image *</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-start gap-4">
                    <div
                      onClick={triggerFileInput}
                      className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors"
                    >
                      {sportData.previewImage ? (
                        <img
                          src={sportData.previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-center text-muted-foreground">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-sm">Upload Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={triggerFileInput} 
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Select Image
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Recommended size: {RECOMMENDED_IMAGE_SIZE}. Max file size: {MAX_FILE_SIZE_MB}MB.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Builder with callback for field changes */}
            <FormBuilder 
              onFieldsChange={setFormFields} 
              initialFields={formFields} 
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/admin/sports")}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                id="submitForm" 
                onClick={handleButtonClick}
                disabled={!isFormValid || isUploading}
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Sport
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}