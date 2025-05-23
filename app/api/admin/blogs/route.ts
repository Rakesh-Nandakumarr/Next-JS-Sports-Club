import { NextRequest, NextResponse } from "next/server";
import Blog from "@/models/Blog";
import { connectDB } from "@/lib/mongodb";

// GET: Fetch blog(s) - either all blogs or a specific one by ID
export async function GET(request: NextRequest) {
  try {
    await connectDB(); // Connect to MongoDB first

    // Check if an ID is provided to fetch a specific blog
    const id = request.nextUrl.searchParams.get("id");

    if (id) {
      const blog = await Blog.findById(id).sort({ createdAt: -1 });
      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }
      return NextResponse.json(blog);
    } else {
      // Fetch all blogs and sort by createdAt in descending order (newest first)
      const blogs = await Blog.find().sort({ createdAt: -1 });
      return NextResponse.json(blogs);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new blog
export async function POST(request: NextRequest) {
  try {
    await connectDB(); // Connect to MongoDB first

    const data = await request.json();

    // Log the data to debug
    console.log("Blog data received:", JSON.stringify(data, null, 2));

    // Make sure we're using the correct field name
    if (data.image && !data.img) {
      data.img = data.image;
      delete data.image;
    }

    const blog = await Blog.create(data);
    console.log("Blog created:", JSON.stringify(blog, null, 2));
    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing blog
export async function PUT(request: NextRequest) {
  try {
    await connectDB(); // Connect to MongoDB first

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Make sure we're using the correct field name
    if (data.image && !data.img) {
      data.img = data.image;
      delete data.image; // Remove the 'image' field to avoid duplication
      console.log("Renamed 'image' field to 'img' in update");
    }

    const blog = await Blog.findByIdAndUpdate(id, data, { new: true });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error: any) {
    console.error("Error updating blog:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a blog
export async function DELETE(request: NextRequest) {
  try {
    await connectDB(); // Connect to MongoDB first

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
