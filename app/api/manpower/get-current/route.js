import { verifyFirebaseToken } from "@/lib/fbAdmin";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyFirebaseToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Lookup manpower data based on Firebase UID
    const { data: manpower, error: manpowerError } = await supabase
      .from("manpower")
      .select("*")
      .eq("auth_id", decoded.uid)
      .single();

    if (manpowerError) {
      if (manpowerError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Manpower not found" },
          { status: 404 }
        );
      }

      console.error("❌ Error fetching manpower data:", manpowerError);
      return NextResponse.json(
        { error: manpowerError.message },
        { status: 500 }
      );
    }

    // If manpower found, fetch their permissions based on role
    let permissions = [];
    if (manpower && manpower.role) {
      // First, get the role ID from the roles table
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id, name")
        .eq("name", manpower.role)
        .single();

      if (roleError) {
        console.error("❌ Error fetching role:", roleError);
      } else if (roleData) {
        // Now get permissions for this role_id
        const { data: permissionsData, error: permissionsError } =
          await supabase
            .from("permissions")
            .select("*")
            .eq("role_id", roleData.id);

        if (permissionsError) {
          console.error("❌ Error fetching permissions:", permissionsError);
        } else {
          permissions = permissionsData || [];
        }
      } else {
        console.log("❌ No role found with name:", manpower.role);
      }
    }

    // If no permissions found, provide default permissions based on role
    if (permissions.length === 0) {
      permissions = getDefaultPermissions(manpower.role);
    }

    return NextResponse.json({
      manpower,
      permissions,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Default permissions fallback
function getDefaultPermissions(role) {
  const defaultPermissions = {
    admin: [
      {
        module: "material_requests",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
      },
      {
        module: "projects",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
      },
      {
        module: "tasks",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
      },
      {
        module: "expenses",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
      },
    ],
    project_manager: [
      {
        module: "material_requests",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false,
      },
      {
        module: "projects",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false,
      },
      {
        module: "tasks",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false,
      },
      {
        module: "expenses",
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
    ],
    supervisor: [
      {
        module: "material_requests",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false,
      },
      {
        module: "projects",
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
      {
        module: "tasks",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false,
      },
      {
        module: "expenses",
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
    ],
    engineer: [
      {
        module: "material_requests",
        can_create: true,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
      {
        module: "projects",
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
      {
        module: "tasks",
        can_create: false,
        can_read: true,
        can_update: true,
        can_delete: false,
      },
      {
        module: "expenses",
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false,
      },
    ],
    finance_officer: [
      {
        module: "material_requests",
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
      {
        module: "projects",
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
      {
        module: "tasks",
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
      {
        module: "expenses",
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false,
      },
    ],
    worker: [
      {
        module: "material_requests",
        can_create: true,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
      {
        module: "projects",
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false,
      },
      {
        module: "tasks",
        can_create: false,
        can_read: true,
        can_update: true,
        can_delete: false,
      },
      {
        module: "expenses",
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false,
      },
    ],
  };

  return defaultPermissions[role] || defaultPermissions["worker"];
}
