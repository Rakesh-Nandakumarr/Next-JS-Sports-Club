import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Sport from "@/models/Sport";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { generateSlug } from "@/lib/utils";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { seedDatabase } from "./dbseed";
// Types for our factory data
interface SportData {
  name: string;
  description: string;
  imageUrl: string;
  slug: string; // Add slug field
  formConfig?: any[];
}

interface TeamData {
  name: string;
  description: string;
  imageUrl: string;
  coach: string;
  sport: mongoose.Types.ObjectId;
  slug: string; // Add slug field
}

interface PlayerData {
  name: string;
  age: number;
  imageUrl: string;
  contact: string;
  team: mongoose.Types.ObjectId;
  sport: mongoose.Types.ObjectId;
  slug: string; // Add slug field
  additionalFields?: Record<string, any>;
}

// Configuration interface for seeding
interface SeederConfig {
  sportCount: number;
  teamsPerSport: number;
  playersPerTeam: number;
}

class SportsSeeder {
  private sportsData: SportData[] = [];
  private teamsData: TeamData[] = [];
  private playersData: PlayerData[] = [];
  private config: SeederConfig;

  // Common form configurations for different sports
  private formConfigs: Record<string, any[]> = {
    soccer: [
      {
        id: "position",
        type: "select",
        label: "Preferred Position",
        required: true,
        options: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
      },
      {
        id: "jerseyNumber",
        type: "number",
        label: "Jersey Number",
        required: true,
        placeholder: "Enter your preferred number",
      },
    ],
    basketball: [
      {
        id: "position",
        type: "select",
        label: "Position",
        required: true,
        options: [
          "Point Guard",
          "Shooting Guard",
          "Small Forward",
          "Power Forward",
          "Center",
        ],
      },
      {
        id: "height",
        type: "text",
        label: "Height (ft)",
        required: true,
        placeholder: "e.g. 6'2\"",
      },
    ],
    tennis: [
      {
        id: "handedness",
        type: "radio",
        label: "Playing Hand",
        required: true,
        options: ["Right-handed", "Left-handed"],
      },
      {
        id: "skillLevel",
        type: "select",
        label: "NTRP Rating",
        required: true,
        options: ["1.0", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0+"],
      },
    ],
  };

  constructor(config: SeederConfig) {
    this.config = config;
    this.initializeSportsData();
  }

  private initializeSportsData() {
    this.sportsData = [
      {
        name: "Soccer",
        description:
          "The world's most popular sport played between two teams of eleven players.",
        imageUrl: this.getSportImage("soccer"),
        slug: generateSlug("Soccer"), // Add slug field
        formConfig: this.formConfigs.soccer,
      },
      {
        name: "Basketball",
        description:
          "A fast-paced team sport played on a rectangular court with a hoop at each end.",
        imageUrl: this.getSportImage("basketball"),
        slug: generateSlug("Basketball"), // Add slug field
        formConfig: this.formConfigs.basketball,
      },
      {
        name: "Tennis",
        description:
          "A racket sport that can be played individually or between two teams of two players each.",
        imageUrl: this.getSportImage("tennis"),
        slug: generateSlug("Tennis"), // Add slug field
        formConfig: this.formConfigs.tennis,
      },
      {
        name: "Volleyball",
        description:
          "A team sport in which two teams of six players are separated by a net.",
        imageUrl: this.getSportImage("volleyball"),
        slug: generateSlug("Volleyball"), // Add slug field
        formConfig: [], // Add empty formConfig
      },
      {
        name: "Swimming",
        description:
          "An individual or team sport that requires the use of one's entire body to move through water.",
        imageUrl: this.getSportImage("swimming"),
        slug: generateSlug("Swimming"), // Add slug field
        formConfig: [], // Add empty formConfig
      },
    ];
  }

  private getSportImage(sport: string): string {
    // Using placeholder images - in a real app, you might use actual img URLs
    const baseUrl = "https://source.unsplash.com/random/300x200/?";
    return `${baseUrl}${sport}`;
  }

  private getTeamImage(sportName: string): string {
    const baseUrl = "https://source.unsplash.com/random/300x200/?";
    return `${baseUrl}${sportName}-team,${faker.color.human()}${faker.number.int(
      100
    )}`;
  }

  private getPlayerImage(): string {
    return `https://randomuser.me/api/portraits/${faker.helpers.arrayElement([
      "men",
      "women",
    ])}/${faker.number.int(100)}.jpg`;
  }

  private generateTeamName(sportName: string): string {
    const prefixes = [
      "United",
      "City",
      "FC",
      "Athletic",
      "Dynamo",
      "Rovers",
      "Wanderers",
    ];
    const suffixes = ["FC", "SC", "AC", "United", "Club"];
    const animals = ["Lions", "Tigers", "Eagles", "Hawks", "Wolves", "Bears"];
    const colors = ["Red", "Blue", "Green", "White", "Black", "Gold", "Silver"];
    const locations = [
      faker.location.city(),
      faker.location.county(),
      faker.location.state({ abbreviated: true }),
    ];

    const nameParts = [
      `${faker.helpers.arrayElement(locations)} ${faker.helpers.arrayElement(
        prefixes
      )}`,
      `${faker.helpers.arrayElement(colors)} ${faker.helpers.arrayElement(
        animals
      )}`,
      `${faker.helpers.arrayElement(locations)} ${faker.helpers.arrayElement(
        suffixes
      )}`,
      `${faker.helpers.arrayElement(colors)} ${faker.helpers.arrayElement(
        prefixes
      )}`,
    ];

    return `${faker.helpers.arrayElement(nameParts)} ${sportName}`;
  }

  private generatePlayerData(
    sportId: mongoose.Types.ObjectId,
    teamId: mongoose.Types.ObjectId
  ): PlayerData {
    const gender = faker.person.sexType();
    const firstName = faker.person.firstName(gender);
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;

    return {
      name: fullName,
      age: faker.number.int({ min: 16, max: 40 }),
      imageUrl: this.getPlayerImage(),
      contact: faker.phone.number(),
      team: teamId,
      sport: sportId,
      slug: generateSlug(fullName), // Add slug field
      additionalFields: {
        jerseyNumber: faker.number.int({ min: 1, max: 99 }),
        position: faker.helpers.arrayElement([
          "Forward",
          "Midfielder",
          "Defender",
          "Goalkeeper",
        ]),
      },
    };
  }

  public async seedDatabase() {
    try {
      // Ensure we're connected to the database
      await connectDB();

      // Clear only specific collections instead of the entire database
      await Sport.deleteMany({});
      await Team.deleteMany({});
      await Player.deleteMany({});
      console.log(
        "Sports, Teams, and Players collections cleared successfully"
      );

      // Seed Sports
      const sports = await Sport.insertMany(this.sportsData);
      console.log(`Seeded ${sports.length} sports`);

      // For each sport, create teams
      for (const sport of sports) {
        // Use the exact number of teams specified
        const teamCount = this.config.teamsPerSport;
        const teamsForSport: TeamData[] = [];

        for (let i = 0; i < teamCount; i++) {
          const teamName = this.generateTeamName(sport.name);
          teamsForSport.push({
            name: teamName,
            description: `The official ${
              sport.name
            } team representing ${faker.location.city()}`,
            imageUrl: this.getTeamImage(sport.name.toLowerCase()),
            coach: `${faker.person.fullName()} ${faker.person.suffix()}`,
            sport: sport._id,
            slug: generateSlug(teamName), // Using the same teamName for consistency
          });
        }

        const createdTeams = await Team.insertMany(teamsForSport);
        console.log(`Seeded ${createdTeams.length} teams for ${sport.name}`);

        // For each team, create players
        for (const team of createdTeams) {
          // Use the exact number of players specified
          const playerCount = this.config.playersPerTeam;
          const playersForTeam: PlayerData[] = [];

          for (let i = 0; i < playerCount; i++) {
            playersForTeam.push(this.generatePlayerData(sport._id, team._id));
          }

          const createdPlayers = await Player.insertMany(playersForTeam);
          console.log(
            `Seeded ${createdPlayers.length} players for team ${team.name}`
          );
        }
      }

      console.log("Database seeding completed successfully!");
    } catch (error) {
      console.error("Error seeding database:", error);
      throw error;
    }
  }

  public async run() {
    try {
      // Connection is now handled inside seedDatabase()
      await this.seedDatabase();
      return "Database seeding completed successfully!";
    } catch (error) {
      console.error("Seeder failed:", error);
      throw error;
    } finally {
      // Don't disconnect here as it might affect other operations
    }
  }
}

// Export a GET handler for the API route
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get seeding parameters from query params with defaults
    const config = {
      sportCount: parseInt(searchParams.get("sports") || "3", 10),
      teamsPerSport: parseInt(searchParams.get("teams") || "4", 10),
      playersPerTeam: parseInt(searchParams.get("players") || "20", 10),
      eventCount: parseInt(searchParams.get("events") || "20", 10),
      blogCount: parseInt(searchParams.get("blogs") || "20", 10),
    };

    // Validate parameters to ensure they're reasonable
    if (config.sportCount < 1) config.sportCount = 1;
    if (config.sportCount > 10) config.sportCount = 10;
    if (config.teamsPerSport < 1) config.teamsPerSport = 1;
    if (config.teamsPerSport > 10) config.teamsPerSport = 10;
    if (config.playersPerTeam < 1) config.playersPerTeam = 1;
    if (config.playersPerTeam > 30) config.playersPerTeam = 30;
    if (config.eventCount < 0) config.eventCount = 0;
    if (config.eventCount > 50) config.eventCount = 50;
    if (config.blogCount < 0) config.blogCount = 0;
    if (config.blogCount > 50) config.blogCount = 50;

    // Ensure we're connected before any operations
    await connectDB();

    // Seed the database with our configuration
    const result = await seedDatabase(config);

    return NextResponse.json({
      success: true,
      message: result.message,
      config: config,
    });
  } catch (error) {
    console.error("Error in seeder route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed database. See server logs for details.",
      },
      { status: 500 }
    );
  }
}
