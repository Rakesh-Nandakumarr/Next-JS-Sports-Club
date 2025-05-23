"use client";
import { useParams } from "next/navigation";
import MainLayout from "@/app/main-layout";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const { sport: slugParam } = useParams();
  const [sportData, setSportData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSportAndTeams() {
      try {
        // Fetch sport data using the slug directly
        const sportResponse = await fetch(`/api/admin/sports?slug=${slugParam}`);
        const sportDataArray = await sportResponse.json();
        
        if (sportDataArray && sportDataArray.length > 0) {
          const sport = sportDataArray[0];
          setSportData(sport);
          
          // Fetch teams using sport ID
          const teamsResponse = await fetch(`/api/admin/teams?sportId=${sport._id}`);
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        }
      } catch (error) {
        console.error("Error fetching sport or teams:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slugParam) {
      fetchSportAndTeams();
    }
  }, [slugParam]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-5 py-10">
          <p className="text-center text-lg">Loading teams...</p>
        </div>
      </MainLayout>
    );
  }

  if (!sportData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-5 py-10">
          <p className="text-center text-lg">Sport not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-5 py-10">
        <h1 className="text-4xl font-bold text-center mb-10 uppercase">{sportData.name} TEAMS</h1>
        <div className="max-w-6xl mx-auto mb-10">
          {sportData.description}
          <br />
          Explore the exciting world of {sportData.name}. Discover our Teams for
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teams.map((team) => (
            <Link
              key={team._id}
              className="relative bg-gray-800 text-white rounded-lg overflow-hidden shadow-md transform transition duration-200 hover:scale-105"
              href={`/team/${team.slug}`}
            >
              <img
                src={team.imageUrl || `https://placehold.co/300x200?text=${team.name}`}
                alt={team.name}
                className="w-full h-48 object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-3xl font-bold uppercase text-white">
                    {team.name}
                  </h2>
                  <p className="text-lg font-semibold">{team.coach}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}