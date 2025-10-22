import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const material_id = searchParams.get("material_id");
    const days = parseInt(searchParams.get("days")) || 30;

    let query = supabase
      .from("inventory_transactions")
      .select(
        `
        *,
        materials (name, unit)
      `
      )
      .order("created_at", { ascending: false });

    if (material_id) {
      query = query.eq("material_id", material_id);
    }

    // Filter by date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    query = query.gte("created_at", startDate.toISOString());

    const { data: transactions, error } = await query;

    if (error) throw error;

    // Get usage history
    const { data: usageHistory, error: usageError } = await supabase
      .from("material_usage")
      .select("*")
      .order("usage_date", { ascending: false });

    if (usageError) throw usageError;

    return NextResponse.json({
      transactions: transactions || [],
      usage_history: usageHistory || [],
      summary: generateSummary(transactions, usageHistory),
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

function generateSummary(transactions, usageHistory) {
  const summary = {
    total_transactions: transactions?.length || 0,
    total_usage:
      usageHistory?.reduce(
        (sum, usage) => sum + parseFloat(usage.quantity_used),
        0
      ) || 0,
    most_used_materials: {},
    monthly_trends: {},
  };

  // Calculate most used materials
  usageHistory?.forEach((usage) => {
    if (!summary.most_used_materials[usage.material_id]) {
      summary.most_used_materials[usage.material_id] = 0;
    }
    summary.most_used_materials[usage.material_id] += parseFloat(
      usage.quantity_used
    );
  });

  // Calculate monthly trends
  transactions?.forEach((transaction) => {
    const month = new Date(transaction.created_at).toISOString().slice(0, 7);
    if (!summary.monthly_trends[month]) {
      summary.monthly_trends[month] = { in: 0, out: 0 };
    }

    if (transaction.type === "IN") {
      summary.monthly_trends[month].in += parseFloat(transaction.quantity);
    } else if (transaction.type === "OUT") {
      summary.monthly_trends[month].out += parseFloat(transaction.quantity);
    }
  });

  return summary;
}
