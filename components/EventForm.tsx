"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface EventFormProps {
  initialData?: EventFormData;
  isEditing?: boolean;
}

interface Sport {
  _id: string;
  name: string;
}

interface Team {
  _id: string;
  name: string;
}

interface EventFormData {
  _id?: string;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  sport?: string;
  teams?: string[];
  capacity: number;
  imageUrl: string;
}

export default function EventForm({
  initialData,
  isEditing = false,
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<EventFormData>({
    defaultValues: initialData || {
      name: "",
      description: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
      sport: "",
      teams: [],
      capacity: 100,
      imageUrl: "",
    },
  });

  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingSports, setIsLoadingSports] = useState(true);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const currentSportId = watch("sport");

  // Fetch sports on component mount
  useEffect(() => {
    fetchSports();
  }, []);

  // Fetch teams when sport changes
  useEffect(() => {
    if (currentSportId) {
      fetchTeams(currentSportId);
    } else {
      setTeams([]);
    }
  }, [currentSportId]);

  const fetchSports = async () => {
    try {
      setIsLoadingSports(true);
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
        description: "Failed to load sports",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSports(false);
    }
  };

  const fetchTeams = async (sportId: string) => {
    try {
      setIsLoadingTeams(true);
      const response = await fetch(`/api/admin/teams?sportId=${sportId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTeams(false);
    }
  };
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    console.log(
      "File selected:",
      file.name,
      "Size:",
      Math.round(file.size / 1024),
      "KB"
    );
    setSelectedFile(file);

    // Create a temporary preview URL for the image
    const previewUrl = URL.createObjectURL(file);
    setValue("imageUrl", previewUrl);
    console.log("Preview URL set:", previewUrl);
  };
  const onSubmit = async (data: EventFormData) => {
    // Validate that a file is selected for new events, or that we have an existing image URL for editing
    if (!selectedFile && !initialData?.imageUrl) {
      toast({
        title: "Error",
        description: "Please select an image for the event",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = data.imageUrl;
      console.log("Initial imageUrl:", imageUrl); // Upload the file if we have a new one selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        console.log("Uploading image file:", selectedFile.name);

        try {
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error("Upload failed:", errorData);
            throw new Error(errorData.error || "Failed to upload image");
          }

          const uploadData = await uploadResponse.json();
          console.log("Upload response:", uploadData);

          if (!uploadData.imageUrl) {
            throw new Error("Failed to get image URL from server");
          }

          imageUrl = uploadData.imageUrl;
          data.imageUrl = uploadData.imageUrl; // Use the actual uploaded image URL
          console.log("Image uploaded successfully:", imageUrl);
        } catch (error) {
          console.error("Image upload error:", error);
          toast({
            title: "Upload Error",
            description:
              error instanceof Error ? error.message : "Failed to upload image",
            variant: "destructive",
          });
          throw error;
        }
      } // Create payload and handle empty sport/teams
      const payload = isEditing
        ? { id: initialData?._id, ...data }
        : { ...data };

      // Remove empty sport value to prevent Cast to ObjectId error
      if (payload.sport === "") {
        delete payload.sport;
      }

      // Remove empty teams array to prevent validation issues
      if (!payload.teams || payload.teams.length === 0) {
        delete payload.teams;
      }

      console.log("Submitting payload:", JSON.stringify(payload, null, 2));

      const endpoint = isEditing ? `/api/admin/events` : "/api/admin/events";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit event");
      }

      toast({
        title: "Success",
        description: isEditing
          ? "Event updated successfully"
          : "Event created successfully",
      });

      router.push("/admin/events");
      router.refresh(); // Refresh the page to reflect changes
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              {...register("name", {
                required: "Name is required",
                maxLength: {
                  value: 100,
                  message: "Name cannot exceed 100 characters",
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...register("location", { required: "Location is required" })}
            />
            {errors.location && (
              <p className="text-sm text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Start Date *</Label>
            <Controller
              control={control}
              name="startDate"
              rules={{ required: "Start date is required" }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <Label>End Date *</Label>
            <Controller
              control={control}
              name="endDate"
              rules={{ required: "End date is required" }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="capacity">Capacity *</Label>
            <Input
              id="capacity"
              type="number"
              {...register("capacity", {
                required: "Capacity is required",
                min: {
                  value: 1,
                  message: "Capacity must be at least 1",
                },
              })}
            />
            {errors.capacity && (
              <p className="text-sm text-destructive">
                {errors.capacity.message}
              </p>
            )}
          </div>

          <div>
            <Label>Sport</Label>
            <Controller
              name="sport"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("teams", []);
                  }}
                  disabled={isLoadingSports}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingSports ? "Loading..." : "Select sport"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport._id} value={sport._id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Teams</Label>
            <Controller
              name="teams"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.[0] || ""}
                  onValueChange={(value) => field.onChange([value])}
                  disabled={!currentSportId || isLoadingTeams}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingTeams
                          ? "Loading..."
                          : !currentSportId
                          ? "Select sport first"
                          : "Select team"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div></div> {/* Empty div to maintain grid alignment */}
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            rows={5}
            className="resize-none"
            {...register("description", {
              required: "Description is required",
            })}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="image">Event Image *</Label>{" "}
          <div className="mt-1 flex items-center">
            {watch("imageUrl") && (
              <div className="relative mr-4 h-16 w-16 overflow-hidden rounded">
                <Image
                  src={watch("imageUrl")}
                  alt="Event preview"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <Input
              id="image"
              type="file"
              onChange={handleImageSelect}
              accept="image/*"
            />
          </div>
          {isSubmitting && selectedFile && (
            <p className="text-sm text-muted-foreground">Uploading image...</p>
          )}
          <input
            type="hidden"
            {...register("imageUrl", { required: "Event image is required" })}
          />
          {errors.imageUrl && (
            <p className="text-sm text-destructive">
              {errors.imageUrl.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Update Event"
            : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
