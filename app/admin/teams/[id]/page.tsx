"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Upload } from "lucide-react";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Team {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  coach: string;
  sport: string | { _id: string; name: string };
  slug: string;
}

interface Sport {
  _id: string;
  name: string;
}

export default function TeamEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isEditMode = params.id !== "create";
  const pageTitle = isEditMode ? "Edit Team" : "Create New Team";

  const startingTeamData = {
    _id: "",
    name: "",
    description: "",
    coach: "",
    sport: "",
    imageFile: null as File | null,
    previewImage: "",
    imageUrl: "",
  };
  const [teamData, setTeamData] = useState(startingTeamData);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch team data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchTeam = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/admin/teams?teamId=${params.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch team");
          }

          const teams = await response.json();
          if (teams && teams.length > 0) {
            const team = teams[0];
            setTeamData({
              _id: team._id,
              name: team.name,
              description: team.description,
              coach: team.coach,
              sport:
                typeof team.sport === "object" ? team.sport._id : team.sport,
              imageFile: null,
              previewImage: team.imageUrl,
              imageUrl: team.imageUrl,
            });
          } else {
            toast({
              title: "Error",
              description: "Team not found",
              variant: "destructive",
            });
            router.push("/admin/teams");
          }
        } catch (error) {
          toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to load team data",
            variant: "destructive",
          });
          console.error("Error fetching team:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTeam();
    }
  }, [isEditMode, params.id, router, toast]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTeamData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.match("image.*")) {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setTeamData((prev) => ({
        ...prev,
        imageFile: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !teamData.name ||
      !teamData.description ||
      !teamData.coach ||
      !teamData.sport
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // When creating a new team or updating with new image, require image upload
    if (!isEditMode && !teamData.imageFile && !teamData.imageUrl) {
      toast({
        title: "Error",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);

    try {
      let imageUrl = teamData.imageUrl; // Use existing image by default

      // If a new image was uploaded, process it
      if (teamData.imageFile) {
        // First upload the image file
        const formData = new FormData();
        formData.append("file", teamData.imageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.imageUrl;
      }

      // Prepare the team data
      const teamPayload = {
        name: teamData.name,
        description: teamData.description,
        coach: teamData.coach,
        sport: teamData.sport,
        imageUrl: imageUrl,
      };

      // Update or create team based on mode
      const response = await fetch(
        isEditMode ? `/api/admin/teams` : "/api/admin/teams",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isEditMode ? { ...teamPayload, id: teamData._id } : teamPayload
          ),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: isEditMode
            ? "Team updated successfully"
            : "Team created successfully",
        });
        router.push("/admin/teams");
      } else {
        const error = await response.json();
        throw new Error(
          error.message || `Failed to ${isEditMode ? "update" : "create"} team`
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Error processing team:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // get all sports data from /api/admin/sports
  const [sports, setSports] = useState<any[]>([]);

  useEffect(() => {
    const fetchSports = async () => {
      const response = await fetch("/api/admin/sports");
      const data = await response.json();
      setSports(data);
    };
    fetchSports();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title={pageTitle} />
        <div className="container py-6">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>
                {isEditMode ? "Edit Team" : "Create New Team"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. Wildcats"
                    value={teamData.name}
                    onChange={handleChange}
                    required
                  />
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter a detailed description of the Team..."
                      value={teamData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="min-h-[120px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Describe the Team, its history, and any other relevant
                      information.
                    </p>
                  </div>

                  <div className="flex justify-between gap-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="coach">Coach Name *</Label>
                      <Input
                        id="coach"
                        name="coach"
                        placeholder="e.g. John Doe"
                        value={teamData.coach}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2 w-full">
                      <Label htmlFor="sport">Sport *</Label>
                      <select
                        id="sport"
                        name="sport"
                        value={teamData.sport}
                        onChange={handleChange}
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                      >
                        <option value="" selected disabled>
                          Select a Sport
                        </option>
                        {sports.map((sport) => (
                          <option value={sport._id} key={sport._id}>
                            {sport.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Team Image *</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <div
                        onClick={triggerFileInput}
                        className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors w-32 h-32"
                      >
                        {" "}
                        {teamData.previewImage ? (
                          // Next Image component would be better here if available
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={teamData.previewImage}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground text-center">
                              Upload Image
                            </span>
                          </>
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
                          Recommended size: 800x600px. Max file size: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  {" "}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/teams")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || isProcessing}>
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditMode ? (
                      "Update Team"
                    ) : (
                      "Create Team"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
