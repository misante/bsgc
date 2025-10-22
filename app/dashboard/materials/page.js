"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MaterialsManagement from "@/components/materials/MaterialsManagement";

export default function MaterialsPage() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 min-h-screen w-full"
      >
        <MaterialsManagement />
      </motion.div>
    </DashboardLayout>
  );
}
