import mongoose, { Schema, model } from "mongoose";
import { generateSlug } from "@/lib/utils";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}
mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;

export interface EventDocument {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  sport?: mongoose.Types.ObjectId | string; // Optional reference to Sport model
  teams?: mongoose.Types.ObjectId[] | string[]; // Optional reference to Team model(s)
}

const EventSchema = new Schema<EventDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    sport: {
      type: Schema.Types.ObjectId,
      ref: "Sport",
      required: false,
    },
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug from name if not provided
EventSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = generateSlug(this.name);
  }
  next();
});

const Event =
  mongoose.models?.Event || model<EventDocument>("Event", EventSchema);
export default Event;
