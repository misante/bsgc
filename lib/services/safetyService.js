import { supabase } from "../supabase";

export const safetyService = {
  // Incident CRUD Operations
  async getIncidents() {
    const { data, error } = await supabase
      .from("safety_incidents")
      .select("*")
      .order("incident_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getIncident(id) {
    const { data, error } = await supabase
      .from("safety_incidents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createIncident(incident) {
    const { data, error } = await supabase
      .from("safety_incidents")
      .insert([incident])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateIncident(id, updates) {
    const { data, error } = await supabase
      .from("safety_incidents")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteIncident(id) {
    const { error } = await supabase
      .from("safety_incidents")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Inspection CRUD Operations
  async getInspections() {
    const { data, error } = await supabase
      .from("safety_inspections")
      .select("*")
      .order("inspection_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createInspection(inspection) {
    const { data, error } = await supabase
      .from("safety_inspections")
      .insert([inspection])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInspection(id, updates) {
    const { data, error } = await supabase
      .from("safety_inspections")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInspection(id) {
    const { error } = await supabase
      .from("safety_inspections")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
  async getTrainings() {
    const { data, error } = await supabase
      .from("safety_trainings")
      .select("*")
      .order("scheduled_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTraining(training) {
    const { data, error } = await supabase
      .from("safety_trainings")
      .insert([training])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTraining(id, updates) {
    const { data, error } = await supabase
      .from("safety_trainings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTraining(id) {
    const { error } = await supabase
      .from("safety_trainings")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
