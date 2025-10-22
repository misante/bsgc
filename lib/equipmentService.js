"use client";
import { supabase } from "./supabase";

export const equipmentService = {
  // Read - Get all equipment
  async getAllEquipment() {
    const { data, error } = await supabase
      .from("equipment")
      .select(
        `
        *,
        operator:operator_id (
          id,
          first_name,
          last_name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching equipment:", error);
      throw error;
    }

    return data || [];
  },

  // Read - Get equipment by ID
  async getEquipmentById(id) {
    const { data, error } = await supabase
      .from("equipment")
      .select(
        `
        *,
        operator:operator_id (
          id,
          first_name,
          last_name
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching equipment:", error);
      throw error;
    }

    return data;
  },

  // Create - Add new equipment
  async createEquipment(equipmentData) {
    const cleanedData = {
      ...equipmentData,
      model: equipmentData.model || null,
      serial_number: equipmentData.serial_number || null,
      maintenance_due_date: equipmentData.maintenance_due_date || null,
      last_maintenance_date: equipmentData.last_maintenance_date || null,
      hours_used: equipmentData.hours_used || 0,
      location: equipmentData.location || null,
      operator_id: equipmentData.operator_id || null,
      project_id: equipmentData.project_id || null,
      purchase_date: equipmentData.purchase_date || null,
      purchase_cost: equipmentData.purchase_cost || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("equipment")
      .insert([cleanedData])
      .select()
      .single();

    if (error) {
      console.error("Error creating equipment:", error);
      throw error;
    }

    return data;
  },

  // Update - Update equipment
  async updateEquipment(id, equipmentData) {
    const cleanedData = {
      ...equipmentData,
      model: equipmentData.model || null,
      serial_number: equipmentData.serial_number || null,
      maintenance_due_date: equipmentData.maintenance_due_date || null,
      hours_used: equipmentData.hours_used || 0,
      location: equipmentData.location || null,
      operator_id: equipmentData.operator_id || null,
      project_id: equipmentData.project_id || null,
      purchase_date: equipmentData.purchase_date || null,
      purchase_cost: equipmentData.purchase_cost || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("equipment")
      .update(cleanedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating equipment:", error);
      throw error;
    }

    return data;
  },

  // Delete - Remove equipment
  async deleteEquipment(id) {
    const { error } = await supabase.from("equipment").delete().eq("id", id);

    if (error) {
      console.error("Error deleting equipment:", error);
      throw error;
    }

    return true;
  },

  // Update equipment status
  async updateEquipmentStatus(id, status) {
    const { data, error } = await supabase
      .from("equipment")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating equipment status:", error);
      throw error;
    }

    return data;
  },

  // Log maintenance
  async logMaintenance(id, maintenanceData) {
    const { data, error } = await supabase
      .from("equipment")
      .update({
        last_maintenance_date: new Date().toISOString(),
        maintenance_due_date: maintenanceData.nextDueDate,
        hours_used: maintenanceData.newHoursUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error logging maintenance:", error);
      throw error;
    }

    return data;
  },
};
