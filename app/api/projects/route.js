// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";
// import { updateProjectProgress } from "@/utils/projects/updateProgress";

// // GET all projects
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get("status");

//     let query = supabase
//       .from("projects")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (status && status !== "all") query = query.eq("status", status);

//     const { data, error } = await query;
//     if (error) throw error;
//     return NextResponse.json(data);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // CREATE new project
// export async function POST(request) {
//   try {
//     const body = await request.json();

//     // 1️⃣ Insert project
//     const projectData = {
//       name: body.name,
//       description: body.description,
//       client: body.client,
//       project_manager: body.project_manager,
//       budget: body.budget ? parseFloat(body.budget) : null,
//       start_date: body.start_date || null,
//       end_date: body.end_date || null,
//       status: body.status || "Planning",
//       phase: body.phase || null,
//       location: body.location,
//       contract_number: body.contract_number,
//       priority: body.priority || "Normal",
//       progress: 0, // Start at 0
//       images: body.images || [],
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     };

//     const { data: project, error: projectError } = await supabase
//       .from("projects")
//       .insert([projectData])
//       .select()
//       .single();
//     if (projectError) throw projectError;

//     // 2️⃣ Fetch task templates
//     const { data: templates, error: templateError } = await supabase
//       .from("task_templates")
//       .select("*");
//     if (templateError) throw templateError;

//     // 3️⃣ Insert template tasks for this project
//     if (templates?.length) {
//       const projectTasks = templates.map((t) => ({
//         project_id: project.id,
//         template_id: t.id,
//         task_name: t.task_name,
//         description: t.description,
//         status: "Pending",
//       }));

//       const { error: taskInsertError } = await supabase
//         .from("tasks")
//         .insert(projectTasks);
//       if (taskInsertError) throw taskInsertError;
//     }

//     return NextResponse.json({ success: true, data: project });
//   } catch (error) {
//     console.error("Error creating project:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // UPDATE project
// export async function PUT(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     const body = await request.json();
//     if (!id)
//       return NextResponse.json(
//         { error: "Project ID is required" },
//         { status: 400 }
//       );

//     // 1️⃣ Update project fields
//     const { data: updatedProject, error } = await supabase
//       .from("projects")
//       .update({
//         ...body,
//         budget: body.budget ? parseFloat(body.budget) : null,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", id)
//       .select()
//       .single();
//     if (error) throw error;

//     // 2️⃣ Recalculate progress based on tasks
//     await updateProjectProgress(id);

//     return NextResponse.json({ success: true, data: updatedProject });
//   } catch (error) {
//     console.error("Error updating project:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { updateProjectProgress } from "@/utils/projects/updateProgress";
import crypto from "crypto"; // If needed for UUID, but assuming upload API handles uniqueness
import { Weight } from "lucide-react";
import { progress } from "framer-motion";

// Assume your storage bucket name is 'images' - replace with your actual bucket name
const BUCKET_NAME = "project-images"; // Change this to your Supabase storage bucket name

// GET all projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (status && status !== "all") query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE new project
export async function POST(request) {
  try {
    const body = await request.json();

    // 1️⃣ Prepare project data (initially set images to empty array)
    const projectData = {
      name: body.name,
      description: body.description,
      client: body.client,
      project_manager: body.project_manager,
      budget: body.budget ? parseFloat(body.budget) : null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      status: body.status || "Planning",
      phase: body.phase || null,
      location: body.location,
      contract_number: body.contract_number,
      priority: body.priority || "Normal",
      progress: 0, // Start at 0
      images: [], // Set to empty initially; will update after if needed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 2️⃣ Insert project
    let { data: project, error: projectError } = await supabase
      .from("projects")
      .insert([projectData])
      .select()
      .single();
    if (projectError) throw projectError;

    // 3️⃣ Handle image relocation if temp images exist (for new projects)
    let finalImages = body.images || [];
    if (body.tempImagePaths && body.tempImagePaths.length > 0) {
      const newUrls = [];
      for (const tempPath of body.tempImagePaths) {
        // Extract filename (assuming path is like 'temp/uuid-filename.jpg')
        const filename = tempPath.split("/").pop();
        const newPath = `projects/${project.id}/${filename}`;

        // Move the file in Supabase storage
        const { error: moveError } = await supabase.storage
          .from(BUCKET_NAME)
          .move(tempPath, newPath);
        if (moveError) {
          console.error(
            `Failed to move image from ${tempPath} to ${newPath}:`,
            moveError
          );
          throw new Error(`Failed to move image: ${moveError.message}`);
        }

        // Get the new public URL
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(newPath);
        newUrls.push(publicUrlData.publicUrl);
      }

      // Update the project with the new image URLs
      const { data: updatedProject, error: updateError } = await supabase
        .from("projects")
        .update({ images: newUrls, updated_at: new Date().toISOString() })
        .eq("id", project.id)
        .select()
        .single();
      if (updateError) throw updateError;

      // Use the updated project for the response
      project = updatedProject;
    } else {
      // If no temp paths, update with provided images (though for new projects, this should be empty or temp)
      if (finalImages.length > 0) {
        const { error: updateError } = await supabase
          .from("projects")
          .update({ images: finalImages, updated_at: new Date().toISOString() })
          .eq("id", project.id);
        if (updateError) throw updateError;
        project.images = finalImages;
      }
    }
    const phases = ["Pre-Construction", "Construction", "Post-Construction"];

    for (const p of phases) {
      const { error: taskInsertError } = await supabase.from("phases").insert({
        name: p,
        project_id: project.id,
        weight: 33.3,
        progress: 0,
        status: "Pending",
      });
      if (taskInsertError) {
        return NextResponse.json({ error: taskInsertError });
      }
    }

    // 4️⃣ Fetch task templates
    const { data: templates, error: templateError } = await supabase
      .from("task_templates")
      .select("*");
    if (templateError) throw templateError;

    // 5️⃣ Insert template tasks for this project
    if (templates?.length) {
      const projectTasks = templates.map((t) => ({
        project_id: project.id,
        template_id: t.id,
        task_name: t.task_name,
        description: t.description,
        phase: t.phase,
        phase_id: t.phase_id,
        weight: t.weight,
        status: "Pending",
      }));

      const { error: taskInsertError } = await supabase
        .from("tasks")
        .insert(projectTasks);
      if (taskInsertError) throw taskInsertError;
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Error creating project:", error);
    // Optional: Add rollback logic here (e.g., delete the project if images fail to move)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE project
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    if (!id)
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );

    // 1️⃣ Update project fields
    const { data: updatedProject, error } = await supabase
      .from("projects")
      .update({
        ...body,
        budget: body.budget ? parseFloat(body.budget) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    // 2️⃣ Recalculate progress based on tasks
    await updateProjectProgress(id);

    return NextResponse.json({ success: true, data: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
