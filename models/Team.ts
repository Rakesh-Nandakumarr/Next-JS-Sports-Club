import  mongoose, { Schema, model } from  "mongoose";
import Sport from "./Sport";
import { generateSlug } from "@/lib/utils";

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
}
mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;

interface TeamDocument {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    coach: string;
    sport: mongoose.Types.ObjectId; // Reference to Sport model
}

const TeamSchema = new Schema<TeamDocument>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        imageUrl: { type: String, required: true },
        coach: { type: String, required: true },
        sport: { type: Schema.Types.ObjectId, ref: Sport, required: true },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to generate slug from name if not provided
TeamSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const Team = mongoose.models?.Team || model<TeamDocument>("Team", TeamSchema);

// Function to get the sport name
export async function getSportName(teamId: string): Promise<string | null> {
    try {
        const team = await Team.findById(teamId).populate("sport").exec();
        if (team && team.sport && typeof team.sport === "object" && "name" in team.sport) {
            return (team.sport as any).name;
        }
        return null;
    } catch (error) {
        console.error("Error fetching sport name:", error);
        return null;
    }
}

export default Team;