"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function EquipmentMasterUI() {
  const [equipments, setEquipments] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    rate_per_hour: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch equipments
  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/equipment/master-equipment");
      const data = await res.json();
      setEquipments(data);
    } catch (err) {
      console.error("Error fetching equipments:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/equipment/master-equipment", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      });
      if (res.ok) {
        fetchEquipments();
        setOpen(false);
        setEditing(null);
        setForm({ name: "", category: "", rate_per_hour: "", description: "" });
      }
    } catch (err) {
      console.error("Error saving equipment:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    try {
      const res = await fetch(`/api/equipment/master-equipment?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchEquipments();
    } catch (err) {
      console.error("Error deleting equipment:", err);
    }
  };

  const openEdit = (equipment) => {
    setEditing(equipment);
    setForm({
      name: equipment.name,
      category: equipment.category,
      rate_per_hour: equipment.rate_per_hour,
      description: equipment.description || "",
    });
    setOpen(true);
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Equipment Master</h1>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Equipment
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p>Loading...</p>
          ) : equipments.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center">
              No equipment found.
            </p>
          ) : (
            equipments.map((eq) => (
              <motion.div key={eq.id} whileHover={{ scale: 1.02 }}>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{eq.name}</span>
                      <div className="flex gap-2">
                        <Pencil
                          className="w-4 h-4 cursor-pointer text-blue-500"
                          onClick={() => openEdit(eq)}
                        />
                        <Trash2
                          className="w-4 h-4 cursor-pointer text-red-500"
                          onClick={() => handleDelete(eq.id)}
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>
                      <strong>Category:</strong> {eq.category}
                    </p>
                    <p>
                      <strong>Rate/hr:</strong> {eq.rate_per_hour}
                    </p>
                    {eq.description && (
                      <p>
                        <strong>Note:</strong> {eq.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Equipment" : "Add New Equipment"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Equipment Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Rate per Hour"
                value={form.rate_per_hour}
                onChange={(e) =>
                  setForm({ ...form, rate_per_hour: e.target.value })
                }
                required
              />
              <Input
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">{editing ? "Update" : "Save"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
