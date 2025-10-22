import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const activeOnly = searchParams.get("activeOnly") !== "false";

    let query = supabase.from("suppliers").select("*", { count: "exact" });

    // Apply filters
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const {
      data: suppliers,
      error,
      count,
    } = await query.range(from, to).order("name", { ascending: true });

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      suppliers: suppliers || [],
      totalPages,
      currentPage: page,
      totalCount: count,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      rating,
      delivery_time_days,
      payment_terms,
      category,
      notes,
    } = await request.json();

    const { data: supplier, error } = await supabase
      .from("suppliers")
      .insert([
        {
          name,
          contact_person,
          email,
          phone,
          address,
          rating: rating || 5,
          delivery_time_days: delivery_time_days || 7,
          payment_terms: payment_terms || "Net 30",
          category,
          notes,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
