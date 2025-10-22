// import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";

// export async function PATCH(req, { params }) {
//   const id = await params.id;
//   try {
//     const body = await req.json();
//     const { data, error } = await supabase
//       .from("materials")
//       .update({ ...body, updated_at: new Date() })
//       .eq("id", id)
//       .select();
//     if (error) throw error;
//     return NextResponse.json({ data });
//   } catch (err) {
//     console.error("PATCH /materials/[id] error", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function DELETE(req, { params }) {
//   const id = params.id;
//   try {
//     const { error } = await supabase.from("materials").delete().eq("id", id);
//     if (error) throw error;
//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("DELETE /materials/[id] error", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data: material, error } = await supabase
      .from("materials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error fetching material:", error);
    return NextResponse.json(
      { error: "Failed to fetch material" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    // If quantity is being updated, create transaction record
    if (updates.quantity !== undefined) {
      const { data: currentMaterial } = await supabase
        .from("materials")
        .select("quantity, min_stock_level")
        .eq("id", id)
        .single();

      if (currentMaterial) {
        await supabase.from("inventory_transactions").insert([
          {
            material_id: id,
            type: "ADJUSTMENT",
            quantity:
              parseFloat(updates.quantity) -
              parseFloat(currentMaterial.quantity),
            previous_stock: parseFloat(currentMaterial.quantity),
            new_stock: parseFloat(updates.quantity),
            reference_type: "UPDATE",
            notes: "Manual quantity adjustment",
          },
        ]);

        // Recalculate status
        updates.status = calculateStockStatus(
          updates.quantity,
          currentMaterial.min_stock_level
        );
      }
    }

    const { data: material, error } = await supabase
      .from("materials")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const { error } = await supabase.from("materials").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}

function calculateStockStatus(quantity, minStock) {
  const qty = parseFloat(quantity);
  const min = parseFloat(minStock) || 0;

  if (qty === 0) return "Out of Stock";
  if (qty <= min) return "Low Stock";
  if (qty <= min * 1.5) return "On Order";
  return "In Stock";
}
