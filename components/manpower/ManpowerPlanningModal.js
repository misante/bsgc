"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

export default function ManpowerPlanningModal({
  open,
  onClose,
  projects = [],
}) {
  const [manpowerList, setManpowerList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    project_id: "",
    manpower_type_id: "",
    quantity_required: "",
    hours_per_day: "",
    rate_per_hour: "",
    start_date: "",
    end_date: "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        project_id: "",
        manpower_type_id: "",
        quantity_required: "",
        hours_per_day: "",
        rate_per_hour: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [open]);

  // Fetch master manpower types
  useEffect(() => {
    if (open) fetchMasterManpower();
  }, [open]);

  const fetchMasterManpower = async () => {
    try {
      const res = await fetch("/api/manpower/master-manpower");
      const data = await res.json();
      setManpowerList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching manpower list:", err);
      toast.error("Failed to fetch manpower list");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      project_id,
      manpower_type_id,
      quantity_required,
      hours_per_day,
      start_date,
      end_date,
    } = formData;

    // Validation
    if (
      !project_id ||
      !manpower_type_id ||
      !quantity_required ||
      !hours_per_day ||
      !start_date ||
      !end_date
    ) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/planning/manpower", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Manpower planning saved successfully!");
        onClose();
      } else {
        toast.error(data.error || "Failed to save manpower plan.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Plan Manpower Requirement
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project
                </label>
                <select
                  required
                  value={formData.project_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, project_id: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select project</option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manpower Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Manpower Type
                </label>
                <select
                  required
                  value={formData.manpower_type_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      manpower_type_id: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select manpower</option>
                  {manpowerList.map((mp) => (
                    <option key={mp.id} value={mp.id}>
                      {mp.name} ({mp.category}) — {mp.rate_per_hour} ETB/hr
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity Required
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity_required || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_required: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter number of workers"
                />
              </div>

              {/* Hours per day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hours per Day
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.hours_per_day || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hours_per_day: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter planned hours per day"
                />
              </div>

              {/* Optional Rate per Hour override */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rate per Hour (optional)
                </label>
                <input
                  type="number"
                  value={formData.rate_per_hour || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rate_per_hour: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Leave blank to use default rate"
                />
              </div>

              {/* Start / End Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        start_date: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        end_date: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-all duration-300"
              >
                {loading ? "Saving..." : "Save Plan"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export default function ManpowerPlanningModal({ open, setOpen }) {
//   const [projects, setProjects] = useState([]);
//   const [masterManpower, setMasterManpower] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     project_id: "",
//     master_manpower_id: "",
//     planned_hours: "",
//     planned_start_date: "",
//     planned_end_date: "",
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [projectsRes, manpowerRes] = await Promise.all([
//           fetch("/api/projects"),
//           fetch("/api/master-manpower"),
//         ]);
//         const [projectsData, manpowerData] = await Promise.all([
//           projectsRes.json(),
//           manpowerRes.json(),
//         ]);
//         setProjects(projectsData);
//         setMasterManpower(manpowerData);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       }
//     };
//     if (open) fetchData();
//   }, [open]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await fetch("/api/manpower-requirement", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       setOpen(false);
//       setForm({
//         project_id: "",
//         master_manpower_id: "",
//         planned_hours: "",
//         planned_start_date: "",
//         planned_end_date: "",
//       });
//     } catch (err) {
//       console.error("Error saving manpower requirement:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent className="max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Plan Manpower Requirement</DialogTitle>
//         </DialogHeader>

//         <motion.form
//           onSubmit={handleSubmit}
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.25 }}
//           className="space-y-5"
//         >
//           {/* Select Project */}
//           <div>
//             <Label>Project</Label>
//             <Select
//               value={form.project_id}
//               onValueChange={(v) => setForm({ ...form, project_id: v })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Project" />
//               </SelectTrigger>
//               <SelectContent>
//                 {projects.map((proj) => (
//                   <SelectItem key={proj.id} value={proj.id}>
//                     {proj.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Select Master Manpower */}
//           <div>
//             <Label>Manpower Type</Label>
//             <Select
//               value={form.master_manpower_id}
//               onValueChange={(v) => setForm({ ...form, master_manpower_id: v })}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select Manpower" />
//               </SelectTrigger>
//               <SelectContent>
//                 {masterManpower.map((mp) => (
//                   <SelectItem key={mp.id} value={mp.id}>
//                     {mp.name} — {mp.category} (${mp.rate_per_hour}/hr)
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Planned Hours */}
//           <div>
//             <Label>Planned Hours</Label>
//             <Input
//               type="number"
//               placeholder="e.g. 160"
//               value={form.planned_hours}
//               onChange={(e) =>
//                 setForm({ ...form, planned_hours: e.target.value })
//               }
//               required
//             />
//           </div>

//           {/* Planned Start & End Dates */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <Label>Start Date</Label>
//               <Input
//                 type="date"
//                 value={form.planned_start_date}
//                 onChange={(e) =>
//                   setForm({ ...form, planned_start_date: e.target.value })
//                 }
//                 required
//               />
//             </div>
//             <div>
//               <Label>End Date</Label>
//               <Input
//                 type="date"
//                 value={form.planned_end_date}
//                 onChange={(e) =>
//                   setForm({ ...form, planned_end_date: e.target.value })
//                 }
//                 required
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-2">
//             <Button
//               variant="outline"
//               type="button"
//               onClick={() => setOpen(false)}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading ? "Saving..." : "Save Plan"}
//             </Button>
//           </div>
//         </motion.form>
//       </DialogContent>
//     </Dialog>
//   );
// }
