import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Get materials that are low stock or will be needed soon based on project phases
    const { data: materials, error: materialsError } = await supabase
      .from("materials")
      .select("*")
      .in("status", ["Low Stock", "On Order"]);

    if (materialsError) throw materialsError;

    // Get project phases to forecast demand
    const { data: phases, error: phasesError } = await supabase
      .from("phases")
      .select("*")
      .order("start_date", { ascending: true });

    if (phasesError) throw phasesError;

    // Get historical usage data for forecasting
    const { data: usageData, error: usageError } = await supabase
      .from("material_usage")
      .select("*")
      .order("usage_date", { ascending: false })
      .limit(100);

    if (usageError) throw usageError;

    // Generate forecast based on historical usage and project phases
    const forecast = generateDemandForecast(materials, phases, usageData);

    return NextResponse.json({ forecast });
  } catch (error) {
    console.error("Error generating forecast:", error);
    return NextResponse.json(
      { error: "Failed to generate forecast" },
      { status: 500 }
    );
  }
}

function generateDemandForecast(materials, phases, usageData) {
  const forecast = [];
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  materials?.forEach((material) => {
    // Calculate average monthly usage
    const materialUsage =
      usageData?.filter((usage) => usage.material_id === material.id) || [];
    const avgMonthlyUsage = calculateAverageUsage(materialUsage);

    // Check if material is linked to upcoming phases
    const upcomingPhases =
      phases?.filter((phase) => {
        const phaseStart = new Date(phase.start_date);
        return phaseStart <= thirtyDaysFromNow && phaseStart >= new Date();
      }) || [];

    upcomingPhases.forEach((phase) => {
      if (material.project_phase === phase.name) {
        forecast.push({
          material_id: material.id,
          material_name: material.name,
          project_phase: phase.name,
          forecasted_quantity: avgMonthlyUsage || material.min_stock_level * 2,
          unit: material.unit,
          required_date: phase.start_date,
          confidence: avgMonthlyUsage ? "HIGH" : "MEDIUM",
        });
      }
    });

    // Add forecast for low stock items
    if (material.quantity <= material.min_stock_level * 1.2) {
      forecast.push({
        material_id: material.id,
        material_name: material.name,
        project_phase: "Stock Replenishment",
        forecasted_quantity: material.min_stock_level * 2 - material.quantity,
        unit: material.unit,
        required_date: new Date().toISOString().split("T")[0],
        confidence: "HIGH",
      });
    }
  });

  return forecast;
}

function calculateAverageUsage(usageData) {
  if (!usageData || usageData.length === 0) return 0;

  const totalUsage = usageData.reduce(
    (sum, usage) => sum + parseFloat(usage.quantity_used),
    0
  );
  return totalUsage / usageData.length;
}
