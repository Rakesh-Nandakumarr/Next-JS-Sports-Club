import mongoose, { Schema, model, models } from "mongoose";
import { generateSlug } from "@/lib/utils";

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
}

// Prevent multiple connections in development
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGODB_URI);
}

mongoose.Promise = global.Promise;

interface FormConfigItem {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
}

interface SportDocument {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    formConfig: FormConfigItem[];
}

const formConfigSchema = new Schema<FormConfigItem>(
    {
        id: { type: String, required: true },
        type: { type: String, required: true },
        label: { type: String, required: true },
        placeholder: { type: String },
        required: { type: Boolean, required: true },
        options: { type: [String] }, // Optional, only needed for 'select', 'radio', etc.
    },
    { _id: false }
);

const sportSchema = new Schema<SportDocument>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        imageUrl: { type: String, required: true },
        formConfig: { type: [formConfigSchema], required: false }, // Make formConfig optional
    },
    { timestamps: true }
);

// Pre-save hook to generate slug from name if not provided
sportSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

const Sport = models?.Sport || model<SportDocument>("Sport", sportSchema);
export default Sport;
