// app/api/indirect-costs/usage/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const table = "daily_indirect_cost_usage";

// 🟢 CREATE
export async function POST(request) {
  const { project_id, indirect_cost_id, quantity_used, usage_date, remarks } =
    await request.json();

  const { data: master } = await supabase
    .from("master_indirect_costs")
    .select("rate_per_unit")
    .eq("id", indirect_cost_id)
    .single();

  const actualCost = (master?.rate_per_unit || 0) * (quantity_used || 0);

  const { data, error } = await supabase
    .from(table)
    .insert({
      project_id,
      indirect_cost_id,
      quantity_used,
      usage_date,
      remarks,
    })
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.rpc("increment_project_actual", {
    p_project_id: project_id,
    p_amount: actualCost,
  });

  return NextResponse.json({ data });
}

// 🟡 READ
export async function GET() {
  const { data, error } = await supabase
    .from(table)
    .select("*, master_indirect_costs(name, rate_per_unit, category)")
    .order("usage_date", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// 🔵 UPDATE
export async function PATCH(request) {
  const { id, quantity_used, remarks } = await request.json();
  const { data, error } = await supabase
    .from(table)
    .update({ quantity_used, remarks })
    .eq("id", id)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// 🔴 DELETE
export async function DELETE(request) {
  const { id, project_id, indirect_cost_id, quantity_used } =
    await request.json();

  const { data: master } = await supabase
    .from("master_indirect_costs")
    .select("rate_per_unit")
    .eq("id", indirect_cost_id)
    .single();

  const deductedCost = (master?.rate_per_unit || 0) * (quantity_used || 0);

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.rpc("increment_project_actual", {
    p_project_id: project_id,
    p_amount: -deductedCost,
  });

  return NextResponse.json({ message: "Deleted successfully" });
}
