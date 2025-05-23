import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/utils";
import mongoose from "mongoose";

// Get all events with optional filtering
export async function GET(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const events = await Event.find({}).sort({ createdAt: -1 });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// Create new event
export async function POST(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const data = await request.json();

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = generateSlug(data.name);
    }

    // Convert string dates to Date objects if needed
    if (typeof data.startDate === "string") {
      data.startDate = new Date(data.startDate);
    }
    if (typeof data.endDate === "string") {
      data.endDate = new Date(data.endDate);
    }

    const currentDate = new Date();
    if (data.startDate > currentDate) {
      data.status = "upcoming";
    } else if (data.startDate <= currentDate && data.endDate >= currentDate) {
      data.status = "ongoing";
    } else if (data.endDate < currentDate) {
      data.status = "completed";
    }

    // Validate date range
    if (data.endDate < data.startDate) {
      return NextResponse.json(
        { message: "End date cannot be before start date" },
        { status: 400 }
      );
    }

    const event = new Event(data);
    await event.save();

    return NextResponse.json(
      { message: "Event created successfully", event },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating event:", error);
    if (error.code === 11000) {
      // Duplicate key error
      return NextResponse.json(
        { message: "An event with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create event ".concat(error.message) },
      { status: 500 }
    );
  }
}

// Update event
export async function PUT(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects if needed
    if (typeof updateData.startDate === "string") {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (typeof updateData.endDate === "string") {
      updateData.endDate = new Date(updateData.endDate);
    }

    // Validate date range if both dates are provided
    if (
      updateData.startDate &&
      updateData.endDate &&
      updateData.endDate < updateData.startDate
    ) {
      return NextResponse.json(
        { message: "End date cannot be before start date" },
        { status: 400 }
      );
    }

    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Event updated successfully", event },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { message: "Failed to update event" },
      { status: 500 }
    );
  }
}

// Delete event
export async function DELETE(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { message: "Failed to delete event" },
      { status: 500 }
    );
  }
}
