// app/api/indirect-costs/requirements/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const table = "indirect_cost_requirements";

// 🟢 CREATE
export async function POST(request) {
  const { project_id, indirect_cost_id, planned_quantity, remarks } =
    await request.json();

  const { data: master } = await supabase
    .from("master_indirect_costs")
    .select("rate_per_unit")
    .eq("id", indirect_cost_id)
    .single();

  const plannedCost = (master?.rate_per_unit || 0) * (planned_quantity || 0);

  const { data, error } = await supabase
    .from(table)
    .insert({ project_id, indirect_cost_id, planned_quantity, remarks })
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.rpc("increment_project_budget", {
    p_project_id: project_id,
    p_amount: plannedCost,
  });

  return NextResponse.json({ data });
}

// 🟡 READ
export async function GET() {
  const { data, error } = await supabase
    .from(table)
    .select("*, master_indirect_costs(name, rate_per_unit, category)")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// 🔵 UPDATE
export async function PATCH(request) {
  const { id, planned_quantity, remarks } = await request.json();
  const { data, error } = await supabase
    .from(table)
    .update({ planned_quantity, remarks })
    .eq("id", id)
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// 🔴 DELETE
export async function DELETE(request) {
  const { id, project_id, indirect_cost_id, planned_quantity } =
    await request.json();

  const { data: master } = await supabase
    .from("master_indirect_costs")
    .select("rate_per_unit")
    .eq("id", indirect_cost_id)
    .single();

  const deductedCost = (master?.rate_per_unit || 0) * (planned_quantity || 0);

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.rpc("increment_project_budget", {
    p_project_id: project_id,
    p_amount: -deductedCost,
  });

  return NextResponse.json({ message: "Deleted successfully" });
}
