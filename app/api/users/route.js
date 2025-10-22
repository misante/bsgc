// import { supabase } from "@/lib/supabase";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   try {
//     const body = await request.json();

//     const { data, error } = await supabase
//       .from("users")
//       .insert([body])
//       .select();

//     if (error) throw error;

//     return NextResponse.json(data[0]);
//   } catch (error) {
//     console.error("Error creating user:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   try {
//     const { data, error } = await supabase
//       .from("users")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) throw error;

//     return NextResponse.json(data);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userData } = await request.json();

    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
