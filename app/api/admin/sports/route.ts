import Sport from "@/models/Sport";
import { generateSlug } from "@/lib/utils";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Request Body:", body); // Log the entire request body
  const { name, description, imageUrl, formConfig } = body; // Ensure formConfig is destructured
  console.log("Form Config:", formConfig); // Log formConfig specifically
  await connectDB();

  try {
    // Generate a slug from the name
    const slug = generateSlug(name);

    // Check if sport with this slug already exists
    const existingSport = await Sport.findOne({ slug });
    if (existingSport) {
      return NextResponse.json(
        { error: "A sport with this name already exists" },
        { status: 400 }
      );
    }

    const sport = await Sport.create({
      name,
      slug,
      description,
      imageUrl,
      formConfig, // Pass formConfig to the model
    });
    return NextResponse.json({ message: "Sport created successfully", sport });
  } catch (error) {
    console.error("Error creating sport:", error); // Log the error for debugging
    return NextResponse.json(
      { error: (error as any).message },
      { status: 500 }
    );
  }
}

// get
export async function GET(request: Request) {
  await connectDB(); // Connect to the database

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("_id");
  const name = searchParams.get("name");
  const slug = searchParams.get("slug");

  try {
    const query: any = {};
    if (id) {
      // Convert id string to ObjectId if present
      const { Types } = await import("mongoose");
      query._id = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
    }
    if (name) query.name = name;
    if (slug) query.slug = slug;

    const sports = await Sport.find(query).sort({ createdAt: -1 }); // MongoDB uses `find` for querying
    console.log(sports);
    return NextResponse.json(sports);
  } catch (error) {
    console.error("Error fetching sports:", error); // Log the error for debugging
    return NextResponse.json(
      { error: (error as any).message },
      { status: 500 }
    );
  }
}

// Update sport
export async function PUT(request: Request) {
  await connectDB(); // Connect to the database

  try {
    const body = await request.json();
    const { id, name, description, imageUrl, formConfig } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Sport ID is required" },
        { status: 400 }
      );
    }

    let updateData: any = { description, imageUrl, formConfig };

    // If name is being updated, update the slug too
    if (name) {
      const slug = generateSlug(name);

      // Check if the new slug would conflict with an existing sport
      const existingSport = await Sport.findOne({
        slug,
        _id: { $ne: id }, // Exclude the current sport
      });

      if (existingSport) {
        return NextResponse.json(
          { error: "Another sport with this name already exists" },
          { status: 400 }
        );
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    const updatedSport = await Sport.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    );

    if (!updatedSport) {
      return NextResponse.json({ error: "Sport not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Sport updated successfully",
      sport: updatedSport,
    });
  } catch (error) {
    console.error("Error updating sport:", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 500 }
    );
  }
}

// Delete sport
export async function DELETE(request: Request) {
  await connectDB(); // Connect to the database

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Sport ID is required" },
        { status: 400 }
      );
    }

    const deletedSport = await Sport.findByIdAndDelete(id);

    if (!deletedSport) {
      return NextResponse.json({ error: "Sport not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Sport deleted successfully" });
  } catch (error) {
    console.error("Error deleting sport:", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 500 }
    );
  }
}
