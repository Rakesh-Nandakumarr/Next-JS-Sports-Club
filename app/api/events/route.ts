import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get("status");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit") as string)
      : 10;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page") as string)
      : 1;
    const sort = searchParams.get("sort") || "startDate"; // Default sort by start date
    const sportId = searchParams.get("sportId");
    const teamId = searchParams.get("teamId");

    // Build query
    const query: any = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by sport if provided
    if (sportId) {
      query.sport = new mongoose.Types.ObjectId(sportId);
    }

    // Filter by team if provided
    if (teamId) {
      query.teams = new mongoose.Types.ObjectId(teamId);
    }

    // For upcoming events, ensure start date is in the future
    if (status === "upcoming") {
      query.startDate = { $gte: new Date() };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Determine sort direction (default ascending for dates)
    const sortDirection = sort === "startDate" ? 1 : -1;
    const sortOption: any = {};
    sortOption[sort] = sortDirection;

    // Perform query with populated references
    const events = await Event.find(query)
      .populate("sport")
      .populate("teams")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    return NextResponse.json(events, {
      headers: {
        "X-Total-Count": total.toString(),
        "X-Page": page.toString(),
        "X-Limit": limit.toString(),
        "X-Total-Pages": Math.ceil(total / limit).toString(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}
