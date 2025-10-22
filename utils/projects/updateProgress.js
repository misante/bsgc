import { supabase } from "@/lib/supabase";

/**
 * Recalculates and updates project progress based on task completion.
 * @param {number} projectId - The project ID to update.
 * @returns {number} Updated progress %
 */
export async function updateProjectProgress(projectId) {
  // 1️⃣ Fetch all tasks for the project
  const { data: tasks, error: fetchError } = await supabase
    .from("tasks")
    .select("id, status")
    .eq("project_id", projectId);

  if (fetchError) throw new Error(fetchError.message);

  // 2️⃣ Calculate completion %
  let progress = 0;
  if (tasks && tasks.length > 0) {
    const completedCount = tasks.filter(
      (task) => task.status?.toLowerCase() === "completed"
    ).length;
    progress = Math.round((completedCount / tasks.length) * 100);
  }

  // 3️⃣ Update project
  const { error: updateError } = await supabase
    .from("projects")
    .update({
      progress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (updateError) throw new Error(updateError.message);

  return progress;
}
