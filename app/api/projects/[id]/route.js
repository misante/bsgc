import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET single project
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Parse images from JSON string to array for frontend
    if (data.images && typeof data.images === "string") {
      try {
        data.images = JSON.parse(data.images);
      } catch (parseError) {
        console.error("Error parsing images JSON:", parseError);
        data.images = [];
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE project
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle images field - ensure it's stored as JSON string
    const updateData = { ...body };

    if (body.images) {
      if (Array.isArray(body.images)) {
        // Convert array to JSON string for storage
        updateData.images = JSON.stringify(body.images);
      } else if (typeof body.images === "string") {
        // If it's already a string, validate it's proper JSON
        try {
          JSON.parse(body.images);
          updateData.images = body.images; // Keep as is if valid JSON
        } catch {
          // If invalid JSON, treat it as a single image URL
          updateData.images = JSON.stringify([body.images]);
        }
      }
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Parse images back to array for response
    if (data.images && typeof data.images === "string") {
      try {
        data.images = JSON.parse(data.images);
      } catch (parseError) {
        console.error("Error parsing images JSON in response:", parseError);
        data.images = [];
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE project
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // First, get the project to delete associated images from storage
    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("images")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching project for deletion:", fetchError);
      // Continue with deletion even if fetch fails
    }

    // Delete associated images from storage if they exist
    if (project?.images) {
      try {
        let imagesArray = [];

        // Parse images from JSON string
        if (typeof project.images === "string") {
          try {
            imagesArray = JSON.parse(project.images);
          } catch (parseError) {
            console.error("Error parsing images for deletion:", parseError);
          }
        } else if (Array.isArray(project.images)) {
          imagesArray = project.images;
        }

        // Delete each image from storage
        if (imagesArray.length > 0) {
          const deletePromises = imagesArray.map(async (imageUrl) => {
            if (imageUrl && imageUrl.includes("supabase.co")) {
              try {
                const url = new URL(imageUrl);
                const pathParts = url.pathname.split("/");
                const filePath = pathParts.slice(5).join("/");

                if (filePath) {
                  console.log("filePath:", filePath);
                  const { error: deleteError } = await supabase.storage
                    .from("project-images")
                    .remove([filePath]);

                  if (deleteError) {
                    console.error(
                      "Error deleting image from storage:",
                      deleteError
                    );
                  } else {
                    console.log("Successfully deleted image:", filePath);
                  }
                }
              } catch (urlError) {
                console.error("Error processing image URL:", urlError);
              }
            }
          });

          await Promise.allSettled(deletePromises);
        }
      } catch (imageDeleteError) {
        console.error("Error during image deletion:", imageDeleteError);
        // Continue with project deletion even if image deletion fails
      }
    }

    // Delete the project from database
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      message: "Project deleted successfully",
      deletedProjectId: id,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(request) {
  try {
    const body = await request.json();
    const { tempImagePaths, ...projectData } = body;

    // First create the project
    const { data: project, error } = await supabase
      .from("projects")
      .insert([
        {
          ...projectData,
          progress: 0, // Default progress
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // If there are temporary images, move them to the project folder
    if (tempImagePaths && tempImagePaths.length > 0 && project.id) {
      try {
        const movePromises = tempImagePaths.map(async (tempPath) => {
          // Extract filename from temp path
          const fileName = tempPath.split("/").pop();
          const newPath = `projects/${project.id}/${fileName}`;

          // Copy file to project folder
          const { data: copyData, error: copyError } = await supabase.storage
            .from("project-images")
            .copy(tempPath, newPath);

          if (copyError) throw copyError;

          // Delete temporary file
          const { error: deleteError } = await supabase.storage
            .from("project-images")
            .remove([tempPath]);

          if (deleteError) {
            console.error("Failed to delete temp file:", tempPath);
          }

          return supabase.storage.from("project-images").getPublicUrl(newPath)
            .data.publicUrl;
        });

        const newImageUrls = await Promise.all(movePromises);

        // Update project with correct image URLs
        const { error: updateError } = await supabase
          .from("projects")
          .update({ images: JSON.stringify(newImageUrls) })
          .eq("id", project.id);

        if (updateError) {
          console.error("Failed to update project images:", updateError);
        }
      } catch (moveError) {
        console.error("Error moving images:", moveError);
        // Continue with project creation even if image move fails
      }
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
