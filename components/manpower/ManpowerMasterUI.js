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

export default function ManpowerMasterUI() {
  const [manpower, setManpower] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    rate_per_hour: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch manpower list
  const fetchManpower = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manpower/master-manpower");
      const data = await res.json();
      setManpower(data);
    } catch (err) {
      console.error("Error fetching manpower:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchManpower();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/manpower/master-manpower", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      });
      if (res.ok) {
        fetchManpower();
        setOpen(false);
        setEditing(null);
        setForm({ name: "", category: "", rate_per_hour: "", description: "" });
      }
    } catch (err) {
      console.error("Error saving manpower:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this manpower category?"))
      return;
    try {
      const res = await fetch(`/api/manpower/master-manpower?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchManpower();
    } catch (err) {
      console.error("Error deleting manpower:", err);
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      rate_per_hour: item.rate_per_hour,
      description: item.description || "",
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
          <h1 className="text-2xl font-semibold">Manpower Master</h1>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Manpower
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p>Loading...</p>
          ) : manpower.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center">
              No manpower record found.
            </p>
          ) : (
            manpower.map((mp) => (
              <motion.div key={mp.id} whileHover={{ scale: 1.02 }}>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{mp.name}</span>
                      <div className="flex gap-2">
                        <Pencil
                          className="w-4 h-4 cursor-pointer text-blue-500"
                          onClick={() => openEdit(mp)}
                        />
                        <Trash2
                          className="w-4 h-4 cursor-pointer text-red-500"
                          onClick={() => handleDelete(mp.id)}
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>
                      <strong>Category:</strong> {mp.category}
                    </p>
                    <p>
                      <strong>Rate/hr:</strong> {mp.rate_per_hour}
                    </p>
                    {mp.description && (
                      <p>
                        <strong>Note:</strong> {mp.description}
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
                {editing ? "Edit Manpower" : "Add New Manpower"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Manpower Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                placeholder="Category (e.g., Skilled, Unskilled, Supervisor)"
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
