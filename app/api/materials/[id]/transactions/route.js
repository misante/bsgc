// // app/api/materials/[id]/transactions/route.js
// import { supabase } from "@/lib/supabase";
// import { NextResponse } from "next/server";

// export async function GET(request, { params }) {
//   const { id } = await params;

//   try {
//     // Get procurement transactions (IN)
//     const { data: procurements, error: procurementError } = await supabase
//       .from("inventory")
//       .select(
//         `
//         *,
//         procurement_orders (
//           id,
//           supplier_name
//         ),
//         master_materials(id,name, unit)
//       `
//       )
//       .eq("material_id", id)
//       .order("received_date", { ascending: false });

//     if (procurementError) throw procurementError;

//     // Get request transactions (OUT)
//     const { data: requests, error: requestError } = await supabase
//       .from("material_requests")
//       .select(
//         `
//         *,
//         master_materials(name, unit),
//         projects(name)
//       `
//       )
//       .eq("material_id", id)
//       .eq("status", "approved")
//       .order("approved_at", { ascending: false });

//     if (requestError) throw requestError;

//     // Combine and format transactions
//     const procurementTransactions =
//       procurements?.map((procurement) => ({
//         id: procurement.id,
//         type: "in",
//         transaction_type: "procurement",
//         quantity: procurement.received_quantity,
//         unit_cost: procurement.unit_cost,
//         total_cost: procurement.received_quantity * procurement.unit_cost,
//         date: procurement.received_date,
//         reference:
//           procurement.procurement_orders?.id ||
//           `PO-${procurement.procurement_order_id}`,
//         supplier: procurement.procurement_orders?.suppliers?.name,
//         location: procurement.location,
//         batch_number: procurement.batch_number,
//         received_by: procurement.received_by,
//         notes: procurement.notes,
//         material_name: procurement.master_materials?.name,
//         unit: procurement.master_materials?.unit,
//       })) || [];

//     const requestTransactions =
//       requests?.map((request) => ({
//         id: request.id,
//         type: "out",
//         transaction_type: "request",
//         quantity: request.approved_quantity || request.requested_quantity,
//         unit_cost: request.unit_cost,
//         total_cost:
//           (request.approved_quantity || request.requested_quantity) *
//           request.unit_cost,
//         date: request.approved_at || request.created_at,
//         reference: `REQ-${request.id}`,
//         project: request.projects?.name,
//         request_reason: request.request_reason,
//         requested_by: request.requested_by,
//         approved_by: request.approved_by,
//         material_name: request.master_materials?.name,
//         unit: request.master_materials?.unit,
//       })) || [];

//     // Combine and sort by date
//     const allTransactions = [
//       ...procurementTransactions,
//       ...requestTransactions,
//     ].sort((a, b) => new Date(b.date) - new Date(a.date));

//     return NextResponse.json({
//       success: true,
//       transactions: allTransactions,
//       summary: {
//         totalIn: procurementTransactions.reduce(
//           (sum, t) => sum + t.quantity,
//           0
//         ),
//         totalOut: requestTransactions.reduce((sum, t) => sum + t.quantity, 0),
//         netChange:
//           procurementTransactions.reduce((sum, t) => sum + t.quantity, 0) -
//           requestTransactions.reduce((sum, t) => sum + t.quantity, 0),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
// app/api/materials/[id]/transactions/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    // Get procurement transactions (IN) from inventory table
    const { data: procurements, error: procurementError } = await supabase
      .from("inventory")
      .select(
        `
        *,
        procurement_orders (
          id,
          supplier_name
        ),
        master_materials!inner(id,name, unit)
      `
      )
      .eq("material_id", id)
      .order("received_at", { ascending: false });

    if (procurementError) {
      console.error("Error fetching procurements:", procurementError);
      throw procurementError;
    }

    // Get request transactions (OUT) from material_requests table
    const { data: requests, error: requestError } = await supabase
      .from("material_requests")
      .select(
        `
        *,
        master_materials!inner(id,name, unit),
        projects(id,name)
      `
      )
      .eq("material_id", id)
      .eq("status", "delivered")
      .order("delivered_at", { ascending: false });

    if (requestError) {
      console.error("Error fetching requests:", requestError);
      throw requestError;
    }

    // Combine and format transactions
    const procurementTransactions =
      procurements?.map((procurement) => ({
        id: `in-${procurement.id}`,
        type: "in",
        transaction_type: "procurement",
        quantity: procurement.received_quantity,
        unit_cost: procurement.unit_cost,
        total_cost: procurement.received_quantity * procurement.unit_cost,
        date: procurement.received_date,
        reference:
          procurement.procurement_orders?.id ||
          `PO-${procurement.procurement_order_id}`,
        supplier: procurement.procurement_orders?.suppliers?.name,
        location: procurement.location,
        batch_number: procurement.batch_number,
        received_by: procurement.received_by,
        notes: procurement.notes,
        material_name: procurement.master_materials?.name,
        unit: procurement.master_materials?.unit,
      })) || [];

    const requestTransactions =
      requests?.map((request) => ({
        id: `out-${request.id}`,
        type: "out",
        transaction_type: "request",
        quantity: request.approved_quantity || request.requested_quantity,
        unit_cost: request.unit_cost || 0,
        total_cost:
          (request.approved_quantity || request.requested_quantity) *
          (request.unit_cost || 0),
        date: request.approved_at || request.created_at,
        reference: `REQ-${request.id}`,
        project: request.projects?.name,
        request_reason: request.request_reason,
        requested_by: request.requested_by,
        approved_by: request.approved_by,
        material_name: request.master_materials?.name,
        unit: request.master_materials?.unit,
      })) || [];

    // Combine and sort by date
    const allTransactions = [
      ...procurementTransactions,
      ...requestTransactions,
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const { data: stock, error: stockError } = await supabase
      .from("material_stock")
      .select("total_quantity")
      .eq("master_material_id", id)
      .single();

    if (stockError) {
      console.error("Error fetching requests:", stockError);
      throw stockError;
    }
    return NextResponse.json({
      success: true,
      transactions: allTransactions,
      current_stock: stock.total_quantity,
      unit:
        procurements[0]?.master_materials?.unit ||
        requests[0]?.master_materials?.unit,
      summary: {
        totalIn: procurementTransactions.reduce(
          (sum, t) => sum + (t.quantity || 0),
          0
        ),
        totalOut: requestTransactions.reduce(
          (sum, t) => sum + (t.quantity || 0),
          0
        ),
        netChange:
          procurementTransactions.reduce(
            (sum, t) => sum + (t.quantity || 0),
            0
          ) -
          requestTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
