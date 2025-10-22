// app/api/upload/delete/route.js
// import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 }
      );
    }

    console.log("Deleting from Supabase storage...", {
      bucket: "project-images",
      path: filePath,
    });

    // Delete from Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("project-images")
      .remove([filePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        {
          error: `Delete failed: ${error.message}`,
        },
        { status: 500 }
      );
    }

    console.log("Delete successful:", filePath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: "Delete failed: " + error.message,
      },
      { status: 500 }
    );
  }
}
