import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import Sport from "@/models/Sport";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Event from "@/models/Event";
import Blog from "@/models/Blog";
import { generateSlug } from "@/lib/utils";

// Types for our factory data
interface SportData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  formConfig?: any[];
}

interface TeamData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  coach: string;
  sport: mongoose.Types.ObjectId;
}

interface PlayerData {
  name: string;
  slug: string;
  age: number;
  imageUrl: string;
  contact: string;
  team: mongoose.Types.ObjectId;
  sport: mongoose.Types.ObjectId;
  additionalFields?: Record<string, any>;
}

interface EventData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  sport?: mongoose.Types.ObjectId;
  teams?: mongoose.Types.ObjectId[];
}

interface BlogData {
  title: string;
  slug: string;
  content: string;
  img: string;
  tags: string[];
  status: "draft" | "published";
}

// Configuration interface for seeding
interface SeederConfig {
  sportCount: number;
  teamsPerSport: number;
  playersPerTeam: number;
  eventCount: number;
  blogCount: number;
}

// Class to handle seeding sports, teams, players, events, and blogs
class SportsSeeder {
  private config: SeederConfig;
  private sportImages: string[];
  private teamImages: string[];
  private playerImages: string[];
  private eventImages: string[];
  private blogImages: string[];
  private blogTags: string[][];  constructor(config: SeederConfig) {
    this.config = config; // Pre-defined images for consistent demo data
    this.sportImages = []; // Will be dynamically generated
    this.teamImages = []; // Will be dynamically generated
    this.playerImages = []; // Will be dynamically generated    
    this.eventImages = []; // Will be dynamically generated

    // Also use event images for blogs for simplicity
    this.blogImages = [
      "https://placehold.co/800x450?text=Blog+Post",
      "https://placehold.co/800x450?text=Article",
      "https://placehold.co/800x450?text=Sports+News",
      "https://placehold.co/800x450?text=Sports+Blog",
      "https://placehold.co/800x450?text=Featured+Article",
    ];

    // Predefined blog tag sets
    this.blogTags = [
      ["Sports", "News", "Updates"],
      ["Event", "Tournament", "Championship"],
      ["Health", "Fitness", "Training"],
      ["Players", "Teams", "Competition"],
      ["Analysis", "Statistics", "Performance"],
      ["Interview", "Profile", "Story"],
      ["Tips", "Strategy", "Tactics"],
      ["History", "Legacy", "Tradition"],
      ["Technology", "Innovation", "Equipment"],
      ["Youth", "Development", "Academy"],
    ];
  }
  // Generate sample data for Teams
  private generateTeamData(sportId: mongoose.Types.ObjectId, sportName: string, sportIndex: number, teamIndex: number): TeamData {
    // Create a more meaningful team name based on the sport
    const teamTypes = ["United", "City", "Athletic", "Rovers", "Rangers", "Warriors", "Eagles", "Tigers", "Lions", "Hawks"];
    const name = `${sportName} ${faker.helpers.arrayElement(teamTypes)}`;
    
    return {
      name,
      slug: generateSlug(name),
      description: faker.lorem.paragraph(),
      imageUrl: this.getTeamImage(name, sportName, sportIndex + 1, teamIndex + 1),
      coach: faker.person.fullName(),
      sport: sportId,
    };
  }  // Generate sample data for Players
  private generatePlayerData(
    sportId: mongoose.Types.ObjectId,
    teamId: mongoose.Types.ObjectId,
    sportName: string,
    teamName: string,
    sportIndex: number,
    teamIndex: number,
    playerIndex: number
  ): PlayerData {
    const gender = faker.person.sexType();
    const firstName = faker.person.firstName(gender);
    const lastName = faker.person.lastName();
    // Add a unique identifier to ensure unique slugs
    const fullName = `${firstName} ${lastName}-${teamIndex}${playerIndex}`;

    return {
      name: fullName,
      slug: generateSlug(fullName),
      age: faker.number.int({ min: 16, max: 40 }),
      imageUrl: this.getPlayerImage(fullName, teamName, sportName, sportIndex + 1, teamIndex + 1, playerIndex + 1),
      contact: faker.phone.number(),
      team: teamId,
      sport: sportId,
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
  }  // Generate sample data for Events
  private generateEventData(
    eventIndex: number,
    sportId?: mongoose.Types.ObjectId,
    sportName?: string,
    teams?: mongoose.Types.ObjectId[]
  ): EventData {
    // Create a start date between now and 60 days in the future
    const startDate = faker.date.future({ years: 0.25 });
    // End date will be between 1 and 3 days after the start date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 3 }));

    // Determine the status based on dates
    const now = new Date();
    let status: "upcoming" | "ongoing" | "completed" | "cancelled" = "upcoming";

    if (startDate <= now && now <= endDate) {
      status = "ongoing";
    } else if (now > endDate) {
      status = "completed";
    } else if (faker.number.int({ min: 1, max: 10 }) === 1) {
      // 10% chance to be cancelled
      status = "cancelled";
    }

    // Event types based on sport
    const eventTypes = [
      "Tournament",
      "Championship",
      "League",
      "Cup",
      "Match",
      "Competition",
    ];

    // Create a more descriptive event name
    let eventName;
    if (sportName) {
      eventName = `${sportName} ${faker.helpers.arrayElement(eventTypes)} ${eventIndex}`;
    } else {
      eventName = `${faker.helpers.arrayElement(eventTypes)} ${faker.word.adjective()} ${eventIndex}`;
    }

    return {
      name: eventName,
      slug: generateSlug(eventName),
      description: faker.lorem.paragraphs(3),
      imageUrl: this.getEventImage(eventName, sportName, eventIndex + 1),
      location: `${faker.location.city()}, ${faker.location.country()}`,
      startDate,
      endDate,
      status,
      sport: sportId,
      teams: teams?.length ? teams : undefined,
    };
  }
  // Generate sample data for Blogs
  private generateBlogData(sports: any[] = [], blogIndex: number): BlogData {
    const title = faker.helpers.arrayElement([
      `Top 10 ${faker.word.adjective()} ${faker.word.noun()} in Sports ${blogIndex}`,
      `Why ${faker.word.adjective()} ${faker.word.noun()} Matter in Sports ${blogIndex}`,
      `The Future of ${faker.word.noun()} in Sports Industry ${blogIndex}`,
      `How to Improve Your ${faker.word.noun()} Skills ${blogIndex}`,
      `${faker.word.adjective()} Techniques for Better Performance ${blogIndex}`,
      `The Rise of Sports Teams in ${blogIndex}`,
      `Journey to Success ${blogIndex}`,
      `Breaking Records: ${faker.word.adjective()} Achievements ${blogIndex}`,
      `The Science Behind Training ${blogIndex}`,
      `${faker.word.adjective()} Strategies for Winning Games ${blogIndex}`,
    ]);

    // Create HTML content with proper formatting
    const paragraphs = faker.lorem.paragraphs(5).split("\n");
    const htmlContent = paragraphs.map((p) => `<p>${p}</p>`).join("");
    const contentWithHeaders = `
      <h2>${faker.lorem.sentence()}</h2>
      ${htmlContent.slice(0, htmlContent.length / 2)}
      <h2>${faker.lorem.sentence()}</h2>
      <ul>
        <li>${faker.lorem.sentence()}</li>
        <li>${faker.lorem.sentence()}</li>
        <li>${faker.lorem.sentence()}</li>
      </ul>
      ${htmlContent.slice(htmlContent.length / 2)}
    `;

    // Generate tags, possibly including a sport name
    let tags = faker.helpers.arrayElements(
      faker.helpers.arrayElement(this.blogTags),
      faker.number.int({ min: 1, max: 4 })
    );

    // 40% chance to include a sport name as a tag
    if (sports.length > 0 && faker.number.int({ min: 1, max: 10 }) <= 4) {
      const sportName = faker.helpers.arrayElement(sports).name;
      if (!tags.includes(sportName)) {
        tags.push(sportName);
      }
    }

    return {
      title,
      slug: generateSlug(title),
      content: contentWithHeaders,
      img: this.getBlogImage(),
      tags,
      status: faker.helpers.arrayElement([
        "draft",
        "published",
        "published",
        "published",
      ]), // 75% published
    };
  }// Get sport image with the sport name
  private getSportImage(sportName: string, index: number): string {
    return `https://placehold.co/300x300?text=Sport${index}+${encodeURIComponent(sportName)}`;
  }
  // Get team image with team and sport names
  private getTeamImage(teamName: string, sportName: string, sportIndex: number, teamIndex: number): string {
    // Create a shorter team name if needed to avoid excessively long URLs
    const shortTeamName = teamName.length > 20 ? teamName.substring(0, 20) + "..." : teamName;
    return `https://placehold.co/400x300?text=Sport${sportIndex}+${encodeURIComponent(sportName)}+Team${teamIndex}`;
  }

  // Get player image with player, team and sport info
  private getPlayerImage(playerName: string, teamName: string, sportName: string, 
                        sportIndex: number, teamIndex: number, playerIndex: number): string {
    // Create a shorter player name if needed to avoid excessively long URLs
    const shortPlayerName = playerName.length > 15 ? playerName.substring(0, 15) + "..." : playerName;
    return `https://placehold.co/300x450?text=Sport${sportIndex}+Team${teamIndex}+Player${playerIndex}`;
  }
  
  // Get event image with event name and associated sport/teams
  private getEventImage(eventName: string, sportName?: string, eventIndex?: number): string {
    // Create a shorter event name to avoid excessively long URLs
    const shortEventName = eventName.length > 25 ? eventName.substring(0, 25) + "..." : eventName;
    if (sportName) {
      return `https://placehold.co/800x450?text=Event${eventIndex}+${encodeURIComponent(sportName)}`;
    }
    return `https://placehold.co/800x450?text=GeneralEvent${eventIndex}`;
  }

  // Get random blog img
  private getBlogImage(): string {
    return faker.helpers.arrayElement(this.blogImages);
  }  // Main method to seed data
  async seed(): Promise<void> {
    // Clear existing data
    await Sport.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Event.deleteMany({});
    await Blog.deleteMany({});

    // Create sports with guaranteed unique names
    const sportNames = [
      "Football",
      "Basketball",
      "Tennis",
      "Cricket",
      "Volleyball",
      "Rugby",
      "Swimming",
      "Badminton",
      "Table Tennis",
      "Hockey",
    ];
    
    // Shuffle and select only the number we need to ensure uniqueness
    const shuffledSportNames = faker.helpers.shuffle([...sportNames]).slice(0, this.config.sportCount);
    
    const sports = [];
    for (let i = 0; i < shuffledSportNames.length; i++) {
      const name = shuffledSportNames[i];
      const sportData = {
        name,
        slug: generateSlug(name),
        description: faker.lorem.paragraph(),
        imageUrl: this.getSportImage(name, i + 1),
        formConfig: [
          {
            id: "jerseyNumber",
            type: "number",
            label: "Jersey Number",
            placeholder: "Enter jersey number",
            required: true,
          },
          {
            id: "position",
            type: "select",
            label: "Position",
            placeholder: "Select position",
            required: true,
            options: ["Forward", "Midfielder", "Defender", "Goalkeeper"],
          },
        ],
      };
      
      const sport = new Sport(sportData);
      await sport.save();
      sports.push({...sport.toObject(), index: i});
    }

    // Create teams for each sport
    const teams: any[] = [];
    for (let sportIndex = 0; sportIndex < sports.length; sportIndex++) {
      const sport = sports[sportIndex];
      for (let teamIndex = 0; teamIndex < this.config.teamsPerSport; teamIndex++) {
        const teamData = this.generateTeamData(sport._id, sport.name, sport.index, teamIndex);
        const team = new Team(teamData);
        await team.save();
        teams.push({ 
          team: team.toObject(), 
          sportId: sport._id, 
          sportName: sport.name,
          sportIndex: sport.index,
          teamIndex: teamIndex
        });
      }
    }

    // Create players for each team
    for (const { team, sportId, sportName, sportIndex, teamIndex } of teams) {
      for (let playerIndex = 0; playerIndex < this.config.playersPerTeam; playerIndex++) {
        const playerData = this.generatePlayerData(
          sportId, 
          team._id, 
          sportName, 
          team.name, 
          sportIndex, 
          teamIndex, 
          playerIndex
        );
        const player = new Player(playerData);
        await player.save();
      }
    }    // Create events (mix of sport-specific and general)
    for (let i = 0; i < this.config.eventCount; i++) {
      if (i < this.config.eventCount * 0.8) {
        // 80% of events are sport-specific
        // Pick a random sport
        const randomSport = faker.helpers.arrayElement(sports);

        // Get teams for this sport
        const sportTeams = teams
          .filter((t) => t.sportId.toString() === randomSport._id.toString())
          .map((t) => t.team._id);

        // Randomly choose 1 or 2 teams for the event
        const eventTeams =
          i % 4 === 0
            ? [] // Some events don't have teams
            : faker.helpers.arrayElements(
                sportTeams,
                faker.number.int({ min: 1, max: 2 })
              );

        const eventData = this.generateEventData(i, randomSport._id, randomSport.name, eventTeams);
        const event = new Event(eventData);
        await event.save();
      } else {
        // 20% of events are general
        const eventData = this.generateEventData(i);
        const event = new Event(eventData);
        await event.save();
      }
    }    // Create blogs
    for (let i = 0; i < this.config.blogCount; i++) {
      const blogData = this.generateBlogData(sports, i);
      const blog = new Blog(blogData);
      await blog.save();
    }
  }
}

export const seedDatabase = async (
  config: SeederConfig = {
    sportCount: 3,
    teamsPerSport: 4,
    playersPerTeam: 20,
    eventCount: 20,
    blogCount: 20,
  }
) => {
  const seeder = new SportsSeeder(config);
  await seeder.seed();
  return { message: "Database seeded successfully!" };
};
