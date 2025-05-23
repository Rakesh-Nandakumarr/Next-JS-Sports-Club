"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import MainLayout from "@/app/main-layout";
import Image from "next/image";
import { User, MapPin, Calendar, Phone, Mail, Info, Award } from "lucide-react";
import Head from "next/head";

export default function PlayerPage() {
  const { id: slugParam } = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (slugParam) {
      const fetchPlayer = async () => {
        try {
          console.log("Fetching player with param:", slugParam);

          // Try first with ID
          let response = await fetch(
            `/api/admin/players?playerId=${slugParam}`
          );
          let data = [];

          try {
            data = await response.json();
            console.log("Response with playerId:", data);
          } catch (e) {
            console.error("Error parsing JSON from playerId response:", e);
          }

          // If no results with ID, try with slug
          if (!response.ok || data.length === 0) {
            console.log("No results with playerId, trying slug...");
            response = await fetch(`/api/admin/players?slug=${slugParam}`);
            try {
              data = await response.json();
              console.log("Response with slug:", data);
            } catch (e) {
              console.error("Error parsing JSON from slug response:", e);
            }
          }

          if (data && data.length > 0) {
            console.log("Player data found:", data[0]);
            setPlayer(data[0]);
          } else {
            console.error("No player found with given ID/slug:", slugParam);
          }
        } catch (error) {
          console.error("Error fetching player details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPlayer();
    }
  }, [slugParam]);
  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <Skeleton className="h-[400px] w-full rounded-lg mb-4" />
            </div>
            <div className="w-full md:w-2/3">
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!player) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto py-10 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <h1 className="text-2xl font-bold mb-4">Player Not Found</h1>
                <p className="text-gray-500 mb-6">
                  The player you are looking for does not exist or has been
                  removed.
                </p>
                <Link href="/">
                  <Button>Return to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Player Image Section */}
          <div className="w-full md:w-1/3">
            <Card className="overflow-hidden">
              <div className="relative w-full h-[450px]">
                {player.imageUrl ? (
                  <div className="w-full h-full relative">
                    <img
                      src={player.imageUrl}
                      alt={player.name || "Player"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const playerName = player.name || "Player";
                        e.currentTarget.src = `https://placehold.co/600x800?text=${encodeURIComponent(
                          playerName
                        )}`;
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Player Details Section */}
          <div className="w-full md:w-2/3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    {" "}
                    <h1 className="text-3xl font-bold tracking-tight">
                      {player.name || "Player"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {player.sport && (
                        <Link
                          href={`/sport/${
                            player.sport.slug || player.sport._id || "#"
                          }`}
                        >
                          <Badge
                            variant="outline"
                            className="px-3 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            {player.sport.name || "Unknown Sport"}
                          </Badge>
                        </Link>
                      )}

                      {player.team && (
                        <Link
                          href={`/team/${
                            player.team.slug || player.team._id || "#"
                          }`}
                        >
                          <Badge className="px-3 py-1 cursor-pointer">
                            {player.team.name || "No Team"}
                          </Badge>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                {player.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">About</h2>
                    <p className="text-gray-700 leading-relaxed">
                      {player.description}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {player.age !== undefined && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">Age: {player.age}</span>
                    </div>
                  )}

                  {player.contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{player.contact}</span>
                    </div>
                  )}
                </div>

                {player.additionalFields &&
                  Object.keys(player.additionalFields).length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4">
                        Player Stats
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(player.additionalFields).map(
                          ([key, value]) => (
                            <Card key={key} className="bg-gray-50 border-0">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                  {key.toLowerCase().includes("number") ? (
                                    <Award className="h-5 w-5 text-primary" />
                                  ) : (
                                    <Info className="h-5 w-5 text-primary" />
                                  )}
                                  <span className="font-medium capitalize">
                                    {key}
                                  </span>
                                </div>
                                <div className="mt-2 text-2xl font-bold">
                                  {String(value)}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    </div>
                  )}
                <div className="flex flex-wrap gap-2 mt-6">
                  {player.team && (
                    <Link
                      href={`/team/${
                        player.team?.slug || player.team?._id || "#"
                      }`}
                    >
                      <Button variant="outline">View Team</Button>
                    </Link>
                  )}
                  {player.sport && (
                    <Link
                      href={`/sport/${
                        player.sport?.slug || player.sport?._id || "#"
                      }`}
                    >
                      <Button variant="outline">View Sport</Button>
                    </Link>
                  )}
                  <Link href="/team">
                    <Button variant="secondary">All Teams</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
