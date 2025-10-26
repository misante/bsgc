// components/tasks/ExportPdfButton.jsx
"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import TaskPdfDocument from "./TaskPdfDocument";

const ExportPdfButton = ({ tasks = [], projects = [] }) => {
  // Ensure we have valid data
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Don't render if no tasks
  if (safeTasks.length === 0) {
    return (
      <button
        disabled
        className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 rounded-lg min-w-[160px] justify-center cursor-not-allowed"
      >
        <FileDown className="w-4 h-4" />
        <span>No Data to Export</span>
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<TaskPdfDocument tasks={safeTasks} projects={safeProjects} />}
      fileName={`tasks-report-${new Date().toISOString().split("T")[0]}.pdf`}
      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 min-w-[160px] justify-center transition-colors"
    >
      {({ loading, error }) => {
        if (error) {
          console.error("PDF generation error:", error);
          return (
            <>
              <FileDown className="w-4 h-4" />
              <span>Error Generating PDF</span>
            </>
          );
        }

        return (
          <>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{loading ? "Generating..." : "Export PDF"}</span>
          </>
        );
      }}
    </PDFDownloadLink>
  );
};

export default ExportPdfButton;
