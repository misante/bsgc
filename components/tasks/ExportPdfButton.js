// "use client";

// import {
//   BlobProvider,
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Font,
// } from "@react-pdf/renderer";

// // Register font
// Font.register({
//   family: "Poppins",
//   src: "/fonts/Poppins-Regular.ttf",
// });

// const styles = StyleSheet.create({
//   page: {
//     padding: 25,
//     fontFamily: "Poppins",
//     fontSize: 9,
//     backgroundColor: "#FFFFFF",
//     color: "#111111",
//   },
//   header: {
//     fontSize: 16,
//     marginBottom: 12,
//     textAlign: "center",
//     textTransform: "uppercase",
//     color: "#222222",
//   },
//   table: {
//     display: "table",
//     width: "auto",
//     borderStyle: "solid",
//     borderColor: "#cccccc",
//     borderWidth: 1,
//   },
//   tableRow: { flexDirection: "row" },
//   colTask: {
//     flex: 2.2,
//     borderRightWidth: 1,
//     borderColor: "#cccccc",
//     padding: 4,
//   },
//   colProject: {
//     flex: 2.2,
//     borderRightWidth: 1,
//     borderColor: "#cccccc",
//     padding: 4,
//   },
//   col: { flex: 1.2, borderRightWidth: 1, borderColor: "#cccccc", padding: 4 },
//   colEnd: { flex: 1.2, padding: 4 },
//   headerText: {
//     fontSize: 10,
//     fontWeight: "bold",
//     color: "#222222",
//     textTransform: "capitalize",
//   },
//   cellText: { fontSize: 9, color: "#333333" },
//   rowAlt: { backgroundColor: "#f9f9f9" },
// });

// export default function ExportPdfButton({ tasks, projects }) {
//   const getProjectName = (projectId) => {
//     const project = projects.find((p) => p.id === projectId);
//     return project ? project.name : "—";
//   };

//   const MyDoc = (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <Text style={styles.header}>Tasks Report</Text>
//         <View style={styles.table}>
//           <View style={[styles.tableRow, { backgroundColor: "#f2f2f2" }]}>
//             <Text style={[styles.colTask, styles.headerText]}>Task Name</Text>
//             <Text style={[styles.colProject, styles.headerText]}>Project</Text>
//             <Text style={[styles.col, styles.headerText]}>Assigned To</Text>
//             <Text style={[styles.col, styles.headerText]}>Priority</Text>
//             <Text style={[styles.col, styles.headerText]}>Status</Text>
//             <Text style={[styles.col, styles.headerText]}>Start Date</Text>
//             <Text style={[styles.colEnd, styles.headerText]}>End Date</Text>
//           </View>
//           {tasks.map((task, i) => (
//             <View
//               key={task.id}
//               style={[styles.tableRow, i % 2 ? styles.rowAlt : null]}
//             >
//               <Text style={[styles.colTask, styles.cellText]}>
//                 {task.task_name || "—"}
//               </Text>
//               <Text style={[styles.colProject, styles.cellText]}>
//                 {getProjectName(task.project_id)}
//               </Text>
//               <Text style={[styles.col, styles.cellText]}>
//                 {task.assigned_to || "—"}
//               </Text>
//               <Text style={[styles.col, styles.cellText]}>
//                 {task.priority || "—"}
//               </Text>
//               <Text
//                 style={[
//                   styles.col,
//                   styles.cellText,
//                   { color: task.status === "Pending" ? "#d97706" : "#16a34a" },
//                 ]}
//               >
//                 {task.status || "—"}
//               </Text>
//               <Text style={[styles.col, styles.cellText]}>
//                 {task.start_date || "—"}
//               </Text>
//               <Text style={[styles.colEnd, styles.cellText]}>
//                 {task.end_date || "—"}
//               </Text>
//             </View>
//           ))}
//         </View>
//       </Page>
//     </Document>
//   );

//   return (
//     <div className="w-full flex justify-center sm:justify-start mt-4">
//       <BlobProvider document={MyDoc}>
//         {({ url, loading }) =>
//           loading ? (
//             <button
//               className="w-full sm:w-auto px-1 py-2.5 text-xs sm:text-base rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 active:scale-95 transition transform duration-150"
//               disabled
//             >
//               Generating...
//             </button>
//           ) : (
//             <a
//               href={url}
//               download="tasks_report.pdf"
//               className="w-full sm:w-auto text-center px-5 py-2.5 text-sm sm:text-base rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 active:scale-95 transition transform duration-150"
//             >
//               Export PDF
//             </a>
//           )
//         }
//       </BlobProvider>
//     </div>
//   );
// }
// components/tasks/ExportPdfButton.jsx
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
