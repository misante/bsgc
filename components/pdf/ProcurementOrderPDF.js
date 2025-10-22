// components/pdf/ProcurementOrderPDF.js
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (optional - for better typography)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #2563eb",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "bold",
    width: "40%",
  },
  value: {
    fontSize: 10,
    color: "#374151",
    width: "60%",
  },
  table: {
    marginTop: 10,
    border: "1pt solid #e5e7eb",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottom: "1pt solid #e5e7eb",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e5e7eb",
    padding: 8,
  },
  tableCell: {
    fontSize: 9,
    padding: 4,
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f0f9ff",
    padding: 10,
    marginTop: 5,
    border: "1pt solid #bae6fd",
    borderRadius: 4,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1pt solid #e5e7eb",
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});

const ProcurementOrderPDF = ({ order }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PROCUREMENT ORDER</Text>
          <Text style={styles.subtitle}>
            Order #{order.id} • Issued: {formatDate(order.created_at)}
          </Text>
        </View>

        {/* Company & Supplier Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARTIES INFORMATION</Text>

          <View style={styles.row}>
            <View style={{ width: "50%" }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  marginBottom: 4,
                  color: "#374151",
                }}
              >
                FROM:
              </Text>
              <Text style={{ fontSize: 9, color: "#374151", marginBottom: 2 }}>
                Your Company Name
              </Text>
              <Text style={{ fontSize: 8, color: "#6b7280" }}>
                123 Business Street
              </Text>
              <Text style={{ fontSize: 8, color: "#6b7280" }}>
                Addis Ababa, Ethiopia
              </Text>
              <Text style={{ fontSize: 8, color: "#6b7280" }}>
                Phone: +251-XXX-XXXXXX
              </Text>
            </View>

            <View style={{ width: "50%" }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  marginBottom: 4,
                  color: "#374151",
                }}
              >
                TO:
              </Text>
              <Text style={{ fontSize: 9, color: "#374151", marginBottom: 2 }}>
                {order.suppliers?.name || "Supplier Name"}
              </Text>
              <Text style={{ fontSize: 8, color: "#6b7280" }}>
                {order.suppliers?.address || "Supplier Address"}
              </Text>
              <Text style={{ fontSize: 8, color: "#6b7280" }}>
                {order.suppliers?.contact_email || "supplier@email.com"}
              </Text>
              <Text style={{ fontSize: 8, color: "#6b7280" }}>
                {order.suppliers?.contact_phone || "Phone: N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORDER DETAILS</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Order Number:</Text>
            <Text style={styles.value}>#{order.id}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Project Phase:</Text>
            <Text style={styles.value}>{order.project_phase || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Expected Delivery:</Text>
            <Text style={styles.value}>
              {formatDate(order.expected_delivery)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Delivery Location:</Text>
            <Text style={styles.value}>
              {order.delivery_location || "Main Warehouse"}
            </Text>
          </View>
        </View>

        {/* Material Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MATERIAL INFORMATION</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[styles.tableCell, { width: "40%", fontWeight: "bold" }]}
              >
                Material
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", fontWeight: "bold" }]}
              >
                Quantity
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", fontWeight: "bold" }]}
              >
                Unit Price
              </Text>
              <Text
                style={[styles.tableCell, { width: "15%", fontWeight: "bold" }]}
              >
                Total
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "40%" }]}>
                {order.master_materials?.name}
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                {order.quantity} {order.master_materials?.unit}
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                {formatCurrency(order.unit_cost)}
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                {formatCurrency(order.total_cost)}
              </Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text
              style={[styles.tableCell, { width: "70%", fontWeight: "bold" }]}
            >
              GRAND TOTAL:
            </Text>
            <Text
              style={[styles.tableCell, { width: "15%", fontWeight: "bold" }]}
            >
              {formatCurrency(order.total_cost)}
            </Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
          <Text style={{ fontSize: 8, color: "#374151", lineHeight: 1.5 }}>
            1. Delivery must be made by the specified expected delivery date.
            {"\n"}
            2. Materials must meet the specified quality standards.{"\n"}
            3. All deliveries must include proper documentation.{"\n"}
            4. Payment will be processed upon satisfactory delivery and
            inspection.{"\n"}
            5. Any delays must be communicated in advance.{"\n"}
            6. The supplier is responsible for proper packaging and
            transportation.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This is an automatically generated procurement order. For any
            inquiries, please contact the procurement department.
          </Text>
          <Text style={{ marginTop: 5 }}>
            Generated on {new Date().toLocaleDateString()} • Your Company Name
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProcurementOrderPDF;
