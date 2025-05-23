import Team from "@/models/Team";
import { generateSlug } from "@/lib/utils";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const body = await request.json();
    const { name, description, imageUrl, coach, sport } = body;

    // Generate a slug from the name
    const slug = generateSlug(name);

    // Check if team with this slug already exists
    const existingTeam = await Team.findOne({ slug });
    if (existingTeam) {
      return NextResponse.json(
        { error: "A team with this name already exists" },
        { status: 400 }
      );
    }

    console.log("Creating team with data:", body);
    const team = await Team.create({
      name,
      slug,
      description,
      imageUrl,
      coach,
      sport,
    });
    return NextResponse.json({ message: "Team created successfully", team });
  } catch (error) {
    return NextResponse.json({ error: (error as any).message });
  }
}

// get
export async function GET(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const { searchParams } = new URL(request.url);
    const sportId = searchParams.get("sportId");
    const slug = searchParams.get("slug");
    const teamId = searchParams.get("teamId");

    const query: any = {};
    if (sportId) query.sport = sportId;
    if (slug) query.slug = slug;
    if (teamId) query._id = teamId;

    const Teams = await Team.find(query)
      .populate("sport")
      .sort({ createdAt: -1 })
      .exec();
    console.log(Teams);
    return NextResponse.json(Teams);
  } catch (error) {
    return NextResponse.json({ error: (error as any).message });
  }
}

// Add PUT endpoint for updating teams
export async function PUT(request: Request) {
  try {
    await connectDB(); // Connect to MongoDB first

    const body = await request.json();
    const { id, name, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    // If name is being updated, update the slug too
    if (name) {
      updateData.slug = generateSlug(name);

      // Check if the new slug would conflict with an existing team
      const existingTeam = await Team.findOne({
        slug: updateData.slug,
        _id: { $ne: id }, // Exclude the current team
      });

      if (existingTeam) {
        return NextResponse.json(
          {
            error: "Another team with this name already exists",
          },
          { status: 400 }
        );
      }

      updateData.name = name;
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    ).populate("sport");

    if (!updatedTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Team updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Error updating team:", error);
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
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const deletedTeam = await Team.findByIdAndDelete(id);

    if (!deletedTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 400 }
    );
  }
}
