import mongoose, { Schema, model } from "mongoose";
import { generateSlug } from "@/lib/utils";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}
mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;

interface PlayerDocument {
  name: string;
  slug: string;
  description?: string;
  age: number;
  imageUrl: string;
  contact: string;
  team: mongoose.Types.ObjectId | string; // Reference to Team model or name
  sport: mongoose.Types.ObjectId | string; // Reference to Sport model or name
  additionalFields?: Record<string, any>; // Dynamic fields stored as key-value pairs
}

const PlayerSchema = new Schema<PlayerDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    age: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    contact: { type: String, required: true },
    team: { 
      type: Schema.Types.Mixed, // Using Mixed type to allow both ObjectId and string
      required: true,
      ref: "Team" 
    },
    sport: { 
      type: Schema.Types.Mixed, // Using Mixed type to allow both ObjectId and string
      required: true,
      ref: "Sport" 
    },
    additionalFields: { 
      type: Schema.Types.Mixed, // Flexible schema for dynamic fields
      default: {} 
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug from name if not provided
PlayerSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = generateSlug(this.name);
  }
  next();
});

const Player = mongoose.models?.Player || model<PlayerDocument>("Player", PlayerSchema);
export default Player;