import { supabase } from "./supabase";

// Projects CRUD
export const projectsDB = {
  // Get all projects with optional filtering
  async getAll(filters = {}) {
    let query = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,client.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get single project
  async getById(id) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create project
  async create(projectData) {
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          ...projectData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Update project
  async update(id, projectData) {
    const { data, error } = await supabase
      .from("projects")
      .update({
        ...projectData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Delete project
  async delete(id) {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
    return { message: "Project deleted successfully" };
  },
};

// Manpower CRUD
export const manpowerDB = {
  async getAll(filters = {}) {
    let query = supabase
      .from("manpower")
      .select("*")
      .order("first_name", { ascending: true });

    if (filters.role && filters.role !== "all") {
      query = query.eq("role", filters.role);
    }

    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,role.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(staffData) {
    const { data, error } = await supabase
      .from("manpower")
      .insert([
        {
          ...staffData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id, staffData) {
    const { data, error } = await supabase
      .from("manpower")
      .update({
        ...staffData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase.from("manpower").delete().eq("id", id);

    if (error) throw error;
    return { message: "Staff member deleted successfully" };
  },
};

// Materials CRUD
export const materialsDB = {
  async getAll(filters = {}) {
    let query = supabase
      .from("materials")
      .select("*")
      .order("name", { ascending: true });

    if (filters.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(materialData) {
    const { data, error } = await supabase
      .from("materials")
      .insert([
        {
          ...materialData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id, materialData) {
    const { data, error } = await supabase
      .from("materials")
      .update({
        ...materialData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase.from("materials").delete().eq("id", id);

    if (error) throw error;
    return { message: "Material deleted successfully" };
  },
};
