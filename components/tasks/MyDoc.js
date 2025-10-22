"use client";

import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Poppins",
  src: "/fonts/Poppins-Regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: "Poppins",
    fontSize: 9,
    backgroundColor: "#FFFFFF",
    color: "#111111",
  },
  header: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
    textTransform: "uppercase",
    color: "#222222",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#cccccc",
    borderWidth: 1,
  },
  tableRow: {
    flexDirection: "row",
  },
  colTask: {
    flex: 2.2,
    borderRightWidth: 1,
    borderColor: "#cccccc",
    padding: 4,
  },
  colProject: {
    flex: 2.2,
    borderRightWidth: 1,
    borderColor: "#cccccc",
    padding: 4,
  },
  col: { flex: 1.2, borderRightWidth: 1, borderColor: "#cccccc", padding: 4 },
  colEnd: { flex: 1.2, padding: 4 },
  headerText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#222222",
    textTransform: "capitalize",
  },
  cellText: {
    fontSize: 9,
    color: "#333333",
  },
  rowAlt: {
    backgroundColor: "#f9f9f9",
  },
});

export default function ExportPdfButton({ tasks = [], projects = [] }) {
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p?.id === projectId);
    return project ? project.name : "—";
  };

  const MyDoc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Tasks Report</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, { backgroundColor: "#f2f2f2" }]}>
            <Text style={[styles.colTask, styles.headerText]}>Task Name</Text>
            <Text style={[styles.colProject, styles.headerText]}>Project</Text>
            <Text style={[styles.col, styles.headerText]}>Assigned To</Text>
            <Text style={[styles.col, styles.headerText]}>Priority</Text>
            <Text style={[styles.col, styles.headerText]}>Status</Text>
            <Text style={[styles.col, styles.headerText]}>Start Date</Text>
            <Text style={[styles.colEnd, styles.headerText]}>End Date</Text>
          </View>
          {tasks.length > 0 ? (
            tasks.map((task, i) => (
              <View
                key={task?.id || i}
                style={[styles.tableRow, i % 2 ? styles.rowAlt : null]}
              >
                <Text style={[styles.colTask, styles.cellText]}>
                  {task?.task_name || "—"}
                </Text>
                <Text style={[styles.colProject, styles.cellText]}>
                  {getProjectName(task?.project_id)}
                </Text>
                <Text style={[styles.col, styles.cellText]}>
                  {task?.assigned_to || "—"}
                </Text>
                <Text style={[styles.col, styles.cellText]}>
                  {task?.priority || "—"}
                </Text>
                <Text
                  style={[
                    styles.col,
                    styles.cellText,
                    {
                      color: task?.status === "Pending" ? "#d97706" : "#16a34a",
                    },
                  ]}
                >
                  {task?.status || "—"}
                </Text>
                <Text style={[styles.col, styles.cellText]}>
                  {task?.start_date || "—"}
                </Text>
                <Text style={[styles.colEnd, styles.cellText]}>
                  {task?.end_date || "—"}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.colTask, styles.cellText]}>
                No tasks available
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );

  return (
    <PDFDownloadLink document={<MyDoc />} fileName="tasks_report.pdf">
      {({ loading }) => (
        <button className="btn-primary px-4 py-2">
          {loading ? "Generating..." : "Export PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
