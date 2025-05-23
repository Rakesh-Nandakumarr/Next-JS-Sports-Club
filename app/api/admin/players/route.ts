import Player from "@/models/Player";
import { generateSlug } from "@/lib/utils";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const body = await request.json();
    const {
      name,
      description,
      age,
      imageUrl,
      contact,
      team,
      sport,
      additionalFields,
    } = body;

    // Generate a slug from the name
    const slug = generateSlug(name);

    // Check if player with this slug already exists
    const existingPlayer = await Player.findOne({ slug });
    if (existingPlayer) {
      return NextResponse.json(
        { error: "A player with this name already exists" },
        { status: 400 }
      );
    }

    console.log("Creating Player with data:", body);
    const player = await Player.create({
      name,
      slug,
      description,
      age,
      imageUrl,
      contact,
      team,
      sport,
      additionalFields,
    });
    return NextResponse.json({
      message: "Player created successfully",
      player,
    });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 400 }
    );
  }
}

// get
export async function GET(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first
    const { searchParams } = new URL(request.url);
    var query: any = {};

    // Handle team ID query
    if (searchParams.has("teamId")) {
      const teamId = searchParams.get("teamId");
      if (teamId) {
        console.log("Searching for players with teamId:", teamId);

        try {
          // Try multiple ways to match the team ID
          query.$or = [
            { team: teamId }, // String match
            { team: new mongoose.Types.ObjectId(teamId) }, // ObjectId match
          ];

          console.log("Query with $or condition:", JSON.stringify(query));
        } catch (err) {
          // If conversion to ObjectId fails, just use the string version
          console.error(
            "Error creating ObjectId, using string match only:",
            err
          );
          query.team = teamId;
        }
      }
    }
    // Handle player ID query
    else if (searchParams.has("playerId")) {
      const playerId = searchParams.get("playerId");
      if (playerId) {
        try {
          query._id = new mongoose.Types.ObjectId(playerId);
        } catch (err) {
          // If not a valid ObjectId, return empty result
          console.error("Invalid player ID format:", playerId);
          return NextResponse.json([]);
        }
      }
    }
    // Handle slug query
    else if (searchParams.has("slug")) {
      const slug = searchParams.get("slug");
      if (slug) {
        query.slug = slug;
      }
    }

    console.log("Player query:", query);
    const players = await Player.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "sport",
        select: "name slug", // Include slug in returned fields
      })
      .populate({
        path: "team",
        select: "name slug coach", // Include slug in returned fields
        populate: {
          path: "coach",
          select: "name contact",
        },
      })
      .exec();

    console.log(`Found ${players.length} players`);
    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 500 }
    );
  }
}

// Add PUT endpoint for updating players
export async function PUT(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const body = await request.json();
    const { id, name, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    // If name is being updated, update the slug too
    if (name) {
      updateData.slug = generateSlug(name);

      // Check if the new slug would conflict with an existing player
      const existingPlayer = await Player.findOne({
        slug: updateData.slug,
        _id: { $ne: id }, // Exclude the current player
      });

      if (existingPlayer) {
        return NextResponse.json(
          {
            error: "Another player with this name already exists",
          },
          { status: 400 }
        );
      }

      updateData.name = name;
    }

    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    )
      .populate("sport")
      .populate({ path: "team", populate: { path: "coach" } });

    if (!updatedPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Player updated successfully",
      player: updatedPlayer,
    });
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 400 }
    );
  }
}

// Add DELETE endpoint
export async function DELETE(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    const deletedPlayer = await Player.findByIdAndDelete(id);

    if (!deletedPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 400 }
    );
  }
}
