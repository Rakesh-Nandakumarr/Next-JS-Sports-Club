"use client";
import { useParams } from "next/navigation";
import MainLayout from "@/app/main-layout";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const { team: slugParam } = useParams();
  const [teamData, setTeamData] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamAndPlayers() {
      try {
        // Fetch team data using the slug directly
        const teamResponse = await fetch(`/api/admin/teams?slug=${slugParam}`);
        const teamDataArray = await teamResponse.json();

        if (teamDataArray && teamDataArray.length > 0) {
          const team = teamDataArray[0];
          setTeamData(team);

          console.log("Team data:", team);
          console.log("Team ID:", team._id); // Fetch players using team ID - ensure it's a string
          const teamId = team._id.toString();
          console.log("Using team ID for query:", teamId);

          try {
            const playersResponse = await fetch(
              `/api/admin/players?teamId=${teamId}`
            );

            if (!playersResponse.ok) {
              console.error(
                `Players API error: ${playersResponse.status} ${playersResponse.statusText}`
              );
              const errorText = await playersResponse.text();
              console.error("Error response:", errorText);
            } else {
              const playersData = await playersResponse.json();
              console.log("Players data:", playersData);
              setPlayers(playersData);
            }
          } catch (error) {
            console.error("Error fetching players:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching team or players:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slugParam) {
      fetchTeamAndPlayers();
    }
  }, [slugParam]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-5 py-10">
          <p className="text-center text-lg">Loading team information...</p>
        </div>
      </MainLayout>
    );
  }

  if (!teamData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-5 py-10">
          <p className="text-center text-lg">Team not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-5 py-10">
        <h1 className="text-4xl font-bold text-center mb-10 uppercase">
          {teamData.name} Players
        </h1>
        <div className="mb-8 text-center">
          <p className="text-xl">{teamData.description}</p>
          <p className="text-lg mt-2">
            <strong>Coach:</strong> {teamData.coach}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {players.length > 0 ? (
            players.map((player) => (
              <Link
                key={player._id}
                className="relative bg-white rounded-lg overflow-hidden shadow-md transform transition duration-200 hover:scale-105"
                href={`/player/${player._id}`}
              >
                <img
                  src={
                    player.imageUrl ||
                    `https://placehold.co/300x1000?text=${player.name}`
                  }
                  alt={player.name}
                  className="w-full h-96 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold">{player.name}</h2>
                  <p className="text-gray-600">Age: {player.age}</p>
                  {player.additionalFields &&
                    Object.keys(player.additionalFields).length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-700">
                          <strong>Additional Info:</strong>
                          {Object.entries(player.additionalFields).map(
                            ([key, value]) => (
                              <span key={key} className="block">
                                <strong>{key}:</strong> {String(value)}
                              </span>
                            )
                          )}
                        </p>
                      </div>
                    )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center">
              <p className="text-lg">No players found for this team.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
