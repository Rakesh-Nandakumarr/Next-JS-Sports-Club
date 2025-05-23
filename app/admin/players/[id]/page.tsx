"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Upload, Loader2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
import DynamicForm from "@/components/dynamic-components/dynamic-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Sport {
  _id: string;
  name: string;
  formConfig?: {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }[];
}

interface Team {
  _id: string;
  name: string;
  sport: string; // This should be sport ID
}

interface FormValues {
  _id?: string;
  name: string;
  description: string;
  contact: string;
  sportId: string;
  teamId: string;
  age: number;
  imageFile: File | null;
  previewImage: string;
  imageUrl?: string;
  [key: string]: any; // For dynamic fields
}

export default function PlayerEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = params.id !== "create";
  const pageTitle = isEditMode ? "Edit Player" : "Create New Player";

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const methods = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      contact: "",
      sportId: "",
      teamId: "",
      age: 18,
      imageFile: null,
      previewImage: "",
      imageUrl: "",
    },
  });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = methods;

  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [isLoading, setIsLoading] = useState({
    form: false,
    sports: true,
    teams: false,
  });
  // Track form dirty state by subscribing to form state changes
  useEffect(() => {
    const subscription = methods.watch(() => {
      setFormIsDirty(methods.formState.isDirty);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Fetch player data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchPlayer = async () => {
        setIsLoading((prev) => ({ ...prev, form: true }));
        try {
          const response = await fetch(`/api/admin/players?id=${params.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch player");
          }

          const players = await response.json();
          if (players && players.length > 0) {
            const player = players[0];

            // Set form values
            reset({
              _id: player._id,
              name: player.name,
              description: player.description || "",
              contact: player.contact,
              sportId:
                typeof player.sport === "object"
                  ? player.sport._id
                  : player.sport,
              teamId:
                typeof player.team === "object" ? player.team._id : player.team,
              age: player.age,
              imageFile: null,
              previewImage: player.imageUrl,
              imageUrl: player.imageUrl,
              ...(player.additionalFields || {}),
            });

            // Set selected sport to load dynamic fields
            if (player.sport && typeof player.sport === "object") {
              setSelectedSport(player.sport as Sport);
            }
          } else {
            toast({
              title: "Error",
              description: "Player not found",
              variant: "destructive",
            });
            router.push("/admin/players");
          }
        } catch (error) {
          toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to load player data",
            variant: "destructive",
          });
          console.error("Error fetching player:", error);
        } finally {
          setIsLoading((prev) => ({ ...prev, form: false }));
        }
      };

      fetchPlayer();
    }
  }, [isEditMode, params.id, reset, router, toast]);

  const currentSportId = watch("sportId");
  const previewImage = watch("previewImage");
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await fetch("/api/admin/sports");
        const data = await res.json();
        setSports(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load sports",
          variant: "destructive",
        });
      } finally {
        setIsLoading((prev) => ({ ...prev, sports: false }));
      }
    };
    fetchSports();
  }, [toast]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!currentSportId) {
        setTeams([]);
        setSelectedSport(null);
        return;
      }

      setIsLoading((prev) => ({ ...prev, teams: true }));
      try {
        const res = await fetch(`/api/admin/teams?sportId=${currentSportId}`);
        const data = await res.json();
        setTeams(data);

        // Find and set the selected sport
        const sport = sports.find((s) => s._id === currentSportId);
        setSelectedSport(sport || null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load teams",
          variant: "destructive",
        });
      } finally {
        setIsLoading((prev) => ({ ...prev, teams: false }));
      }
    };

    fetchTeams();
  }, [currentSportId, sports, toast]);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setValue("imageFile", file);
    setValue("previewImage", URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (!data.imageFile) {
        throw new Error("Player image is required");
      }

      // Upload image
      const formData = new FormData();
      formData.append("file", data.imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { imageUrl } = await uploadRes.json();

      // Find sport and team names
      const sport = sports.find((s) => s._id === data.sportId);
      const team = teams.find((t) => t._id === data.teamId);

      if (!sport || !team) {
        throw new Error("Invalid sport or team selection");
      }

      // Prepare dynamic fields
      const dynamicFields = selectedSport?.formConfig?.reduce((acc, field) => {
        if (data[field.id] !== undefined) {
          acc[field.label] = data[field.id];
        }
        return acc;
      }, {} as Record<string, any>);

      // Create player
      const playerRes = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          contact: data.contact,
          sport: sport._id, // Using ID is better for backend
          team: team._id, // Using ID is better for backend
          age: data.age,
          imageUrl,
          additionalFields: dynamicFields,
        }),
      });

      if (!playerRes.ok) {
        const errorData = await playerRes.json();
        throw new Error(errorData.message || "Player creation failed");
      }

      toast({
        title: "Success",
        description: "Player created successfully",
      });

      reset();
      router.push("/admin/players");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full">
        <SiteHeader title="Players" />
        <div className="container py-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create New Player</CardTitle>
            </CardHeader>
            <CardContent>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Player Name *</Label>
                    <Input
                      {...register("name", { required: "Name is required" })}
                      placeholder="Player name"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      {...register("description")}
                      placeholder="Player description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Info</Label>
                      <Input
                        {...register("contact")}
                        placeholder="Email or phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        {...register("age", {
                          valueAsNumber: true,
                          min: { value: 1, message: "Age must be at least 1" },
                          max: {
                            value: 100,
                            message: "Age must be at most 100",
                          },
                        })}
                        placeholder="Age"
                      />
                      {errors.age && (
                        <p className="text-sm text-destructive">
                          {errors.age.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sport *</Label>
                      <Controller
                        name="sportId"
                        control={control}
                        rules={{ required: "Sport is required" }}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setValue("teamId", "");
                            }}
                            disabled={isLoading.sports}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoading.sports
                                    ? "Loading..."
                                    : "Select sport"
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
                      {errors.sportId && (
                        <p className="text-sm text-destructive">
                          {errors.sportId.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Team *</Label>
                      <Controller
                        name="teamId"
                        control={control}
                        rules={{ required: "Team is required" }}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!currentSportId || isLoading.teams}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoading.teams
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
                      {errors.teamId && (
                        <p className="text-sm text-destructive">
                          {errors.teamId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedSport?.formConfig && (
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">
                        Additional Information
                      </h3>
                      <DynamicForm fields={selectedSport.formConfig} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Player Image *</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center border-2 border-dashed rounded-lg w-32 h-32 cursor-pointer hover:bg-accent"
                      >
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="mx-auto w-8 h-8 mb-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Upload Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Select Image
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Recommended: 800x600px, max 5MB
                        </p>
                        {!previewImage && (
                          <p className="text-sm text-destructive">
                            Player image is required
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/players")}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                          Creating...
                        </>
                      ) : (
                        "Create Player"
                      )}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
