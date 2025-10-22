// app/api/materials/inventory/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export async function POST(request) {
  try {
    const body = await request.json();
    // Start a transaction
    const { data: inventory, error: inventoryError } = await supabase
      .from("inventory")
      .insert([body])
      .select()
      .single();

    if (inventoryError) throw inventoryError;

    // Update procurement order status to 'received'
    const { error: orderError } = await supabase
      .from("procurement_orders")
      .update({
        status: "received",
        received_at: body.received_at,
        received_by: body.received_by,
      })
      .eq("id", body.procurement_order_id);

    if (orderError) throw orderError;

    return NextResponse.json(inventory, { status: 201 });
  } catch (error) {
    console.error("Error adding to inventory:", error);
    return NextResponse.json(
      { error: "Failed to add to inventory" },
      { status: 500 }
    );
  }
}
// export async function POST(request) {
//   try {
//     const {
//       material_name,
//       procurement_order_id,
//       master_material_id,
//       quantity,
//       location,
//       batch_number,
//       received_date,
//       expiry_date,
//       unit_cost,
//       total_value,
//       received_by,
//       notes,
//     } = await request.json();

//     // Start a transaction
//     const { data: inventory, error: inventoryError } = await supabase
//       .from("inventory")
//       .insert([
//         {
//           name: material_name,
//           procurement_order_id,
//           master_material_id,
//           quantity: parseFloat(quantity),
//           location,
//           batch_number,
//           received_date,
//           expiry_date,
//           unit_cost: parseFloat(unit_cost),
//           total_value: parseFloat(total_value),
//           received_by,
//           received_at: new Date().toISOString(),
//           notes,
//         },
//       ])
//       .select()
//       .single();

//     if (inventoryError) throw inventoryError;

//     // Update procurement order status to 'received'
//     const { error: orderError } = await supabase
//       .from("procurement_orders")
//       .update({
//         status: "received",
//         received_at: new Date().toISOString(),
//         received_by: "Anteneh",
//       })
//       .eq("id", procurement_order_id);

//     if (orderError) throw orderError;

//     return NextResponse.json(inventory, { status: 201 });
//   } catch (error) {
//     console.error("Error adding to inventory:", error);
//     return NextResponse.json(
//       { error: "Failed to add to inventory" },
//       { status: 500 }
//     );
//   }
// }

// Add GET method to fetch inventory
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const status = searchParams.get("status") || "all";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build the query
    let query = supabase.from("inventory").select(
      `
        *,
        master_materials (id, name, unit, category, min_stock_level),
        procurement_orders (
          supplier_id,
          expected_delivery,
          suppliers (name)
        )
      `,
      { count: "exact" }
    );

    // Apply search filter
    if (search) {
      query = query.or(
        `master_materials.name.ilike.%${search}%,location.ilike.%${search}%,batch_number.ilike.%${search}%`
      );
    }

    // Apply category filter
    if (category !== "all") {
      query = query.eq("master_materials.category", category);
    }

    // Apply status filter based on quantity and min_stock_level
    if (status !== "all") {
      if (status === "low_stock") {
        query = query.lte(
          "quantity",
          supabase.raw("master_materials.min_stock_level")
        );
      } else if (status === "out_of_stock") {
        query = query.eq("quantity", 0);
      } else if (status === "in_stock") {
        query = query.gt(
          "quantity",
          supabase.raw("master_materials.min_stock_level")
        );
      }
    }

    // Apply pagination and ordering
    const {
      data: inventory,
      error,
      count,
    } = await query
      .order("received_date", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Calculate status for each inventory item
    const inventoryWithStatus =
      inventory?.map((item) => {
        let status = "In Stock";
        if (item.quantity <= 0) {
          status = "Out of Stock";
        } else if (
          item.master_materials?.min_stock_level &&
          item.quantity <= item.master_materials.min_stock_level
        ) {
          status = "Low Stock";
        }

        return {
          ...item,
          status,
        };
      }) || [];
    return NextResponse.json({
      inventory: inventoryWithStatus,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
