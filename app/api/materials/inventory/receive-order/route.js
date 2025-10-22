// // app/api/inventory/receive-order/route.js
// import { supabase } from "@/lib/supabase";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   const body = await request.json();
//   console.log("received body detail:", body);
//   try {
//     // 1. Insert the new inventory record
//     const { data: inventoryRecord, error: inventoryError } = await supabase
//       .from("inventory")
//       .insert([body])
//       .select()
//       .single();

//     if (inventoryError) {
//       console.error("Error creating inventory record:", inventoryError);
//       return NextResponse.json(
//         { error: inventoryError.message },
//         { status: 400 }
//       );
//     }

//     // 2. Update the order status to 'received'
//     const { error: orderError } = await supabase
//       .from("procurement_orders")
//       .update({
//         status: "received",
//         received_at: new Date().toISOString(),
//       })
//       .eq("id", body.procurement_order_id);

//     if (orderError) {
//       console.error("Error updating order status:", orderError);
//       // Don't fail the request if order update fails, but log it
//     }

//     // 3. Update material stock in material_stock table
//     await updateMaterialStock(
//       body.material_id,
//       body.received_quantity,
//       body.unit_cost
//     );

//     return NextResponse.json({
//       success: true,
//       data: inventoryRecord,
//       message: "Order received successfully",
//     });
//   } catch (error) {
//     console.error("Error in receive-order API:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to update material stock
// async function updateMaterialStock(master_material_id, quantity, unit_cost) {
//   try {
//     // Check if material stock record exists
//     const { data: existingStock } = await supabase
//       .from("material_stock")
//       .select("*")
//       .eq("master_material_id", master_material_id)
//       .single();

//     if (existingStock) {
//       // Update existing stock
//       const newQuantity =
//         parseFloat(existingStock.total_quantity) + parseFloat(quantity);
//       const newTotalValue =
//         parseFloat(existingStock.total_value) +
//         parseFloat(quantity) * parseFloat(unit_cost);
//       const average_unit_cost = newTotalValue / newQuantity;

//       const { error } = await supabase
//         .from("material_stock")
//         .update({
//           total_quantity: newQuantity,
//           total_value: newTotalValue,
//           average_unit_cost: average_unit_cost,
//           last_received_date: new Date().toISOString(),
//           updated_at: new Date().toISOString(),
//         })
//         .eq("master_material_id", master_material_id);

//       if (error) {
//         console.error("Error updating material stock:", error);
//       }
//     } else {
//       // Create new stock record
//       const total_value = parseFloat(quantity) * parseFloat(unit_cost);

//       const { error } = await supabase.from("material_stock").insert([
//         {
//           master_material_id,
//           total_quantity: quantity,
//           total_value: total_value,
//           average_unit_cost: unit_cost,
//           last_received_date: new Date().toISOString(),
//         },
//       ]);

//       if (error) {
//         console.error("Error creating material stock:", error);
//       }
//     }
//   } catch (error) {
//     console.error("Error in updateMaterialStock:", error);
//   }
// }
// app/api/inventory/receive-order/route.js
// app/api/materials/inventory/receive-order/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();

  try {
    // 1. Insert the new inventory record
    const { data: inventoryRecord, error: inventoryError } = await supabase
      .from("inventory")
      .insert([body])
      .select()
      .single();

    if (inventoryError) {
      console.error("Error creating inventory record:", inventoryError);
      return NextResponse.json(
        { error: inventoryError.message },
        { status: 400 }
      );
    }

    // 2. Update the procurement order status to 'received'
    const { error: orderError } = await supabase
      .from("procurement_orders")
      .update({
        status: "received",
        received_at: new Date().toISOString(),
      })
      .eq("id", body.procurement_order_id);

    if (orderError) {
      console.error("Error updating procurement order status:", orderError);
      // Don't fail the request if order update fails, but log it
    }

    // 3. Update material stock in material_stock table with all details
    await updateMaterialStock({
      master_material_id: body.material_id,
      quantity: body.received_quantity,
      unit_cost: body.unit_cost,
      location: body.location,
      batch_number: body.batch_number,
      received_date: body.received_date,
      expiry_date: body.expiry_date,
      received_by: body.received_by,
      notes: body.notes,
      supplier_name: body.supplier_name,
      procurement_order_id: body.procurement_order_id,
    });

    return NextResponse.json({
      success: true,
      data: inventoryRecord,
      message: "Order received successfully",
    });
  } catch (error) {
    console.error("Error in receive-order API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Updated helper function to update material stock with all details
async function updateMaterialStock({
  master_material_id,
  quantity,
  unit_cost,
  location,
  batch_number,
  received_date,
  expiry_date,
  received_by,
  notes,
  supplier_name,
  procurement_order_id,
}) {
  try {
    // Check if material stock record exists
    const { data: existingStock } = await supabase
      .from("material_stock")
      .select("*")
      .eq("master_material_id", master_material_id)
      .single();

    const quantityNum = parseFloat(quantity);
    const unitCostNum = parseFloat(unit_cost);

    if (existingStock) {
      // Update existing stock
      const newQuantity =
        parseFloat(existingStock.total_quantity) + quantityNum;
      const newTotalValue =
        parseFloat(existingStock.total_value) + quantityNum * unitCostNum;
      const average_unit_cost = newTotalValue / newQuantity;

      const { error } = await supabase
        .from("material_stock")
        .update({
          total_quantity: newQuantity,
          total_value: newTotalValue,
          average_unit_cost: average_unit_cost,
          location: location,
          batch_number: batch_number,
          received_date: received_date,
          expiry_date: expiry_date || existingStock.expiry_date,
          unit_cost: unitCostNum,
          received_by: received_by,
          notes: notes,
          supplier_name: supplier_name,
          last_procurement_order_id: procurement_order_id,
          last_received_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("master_material_id", master_material_id);

      if (error) {
        console.error("Error updating material stock:", error);
      }
    } else {
      // Create new stock record
      const total_value = quantityNum * unitCostNum;

      const { error } = await supabase.from("material_stock").insert([
        {
          master_material_id,
          total_quantity: quantityNum,
          total_value: total_value,
          average_unit_cost: unitCostNum,
          location,
          batch_number,
          received_date,
          expiry_date,
          unit_cost: unitCostNum,
          received_by,
          notes,
          supplier_name,
          last_procurement_order_id: procurement_order_id,
          last_received_date: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error creating material stock:", error);
      }
    }
  } catch (error) {
    console.error("Error in updateMaterialStock:", error);
  }
}
