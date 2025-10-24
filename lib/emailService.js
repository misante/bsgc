// import "server-only";
// import fs from "fs";
// import path from "path";
// import { Resend } from "resend";
// import { PDFDocument, rgb } from "pdf-lib";
// import fontkit from "@pdf-lib/fontkit";

// const resend = new Resend(process.env.RESEND_API_KEY);
// export class EmailService {
//   static async sendProcurementOrderEmail(order, supplierEmail) {
//     try {
//       // Generate PDF buffer
//       const pdfBuffer = await this.generatePDF(order);

//       // Convert buffer to base64 for email attachment
//       const pdfBase64 = pdfBuffer.toString("base64");

//       const { data, error } = await resend.emails.send({
//         from: "BSGC Procurement <sales@zantex.store>",
//         to: [supplierEmail],
//         subject: `Procurement Order #${order.id} - ${this.capitalizeWords(
//           order.master_materials?.name
//         )}`,
//         html: this.generateEmailHTML(order),
//         attachments: [
//           {
//             filename: `procurement-order-${order.id}.pdf`,
//             content: pdfBase64,
//           },
//         ],
//       });

//       if (error) {
//         console.error("Error sending email:", error);
//         throw error;
//       }

//       console.log("Email sent successfully:", data);
//       return data;
//     } catch (error) {
//       console.error("Error in sendProcurementOrderEmail:", error);
//       throw error;
//     }
//   }

//   static capitalizeWords(str) {
//     if (!str) return "";
//     return str.replace(/\b\w/g, (char) => char.toUpperCase());
//   }

//   static async generatePDF(order) {
//     try {
//       const pdfDoc = await PDFDocument.create();
//       pdfDoc.registerFontkit(fontkit);

//       // ✅ Load Poppins font from /public/fonts
//       const fontPath = path.resolve("./public/fonts/Poppins-Regular.ttf");
//       const fontBytes = fs.readFileSync(fontPath);
//       const poppins = await pdfDoc.embedFont(fontBytes);
//       // const fontUrl = new URL(
//       //   `${
//       //     process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
//       //   }/fonts/Poppins-Regular.ttf`
//       // );
//       // const fontResponse = await fetch(fontUrl);
//       // const fontBytes = await fontResponse.arrayBuffer();
//       // const poppins = await pdfDoc.embedFont(fontBytes);
//       // A4 size
//       const page = pdfDoc.addPage([595.28, 841.89]);
//       const { width, height } = page.getSize();
//       let y = height - 60;

//       // Helper functions
//       const addText = (
//         text,
//         x,
//         y,
//         size = 11,
//         bold = false,
//         color = rgb(0.1, 0.1, 0.1),
//         align = "left"
//       ) => {
//         const textWidth = poppins.widthOfTextAtSize(text, size);
//         const xPos =
//           align === "center"
//             ? (width - textWidth) / 2
//             : align === "right"
//             ? width - textWidth - x
//             : x;
//         page.drawText(text, { x: xPos, y, size, font: poppins, color });
//       };

//       const formatCurrency = (amount) =>
//         new Intl.NumberFormat("en-ET", {
//           style: "currency",
//           currency: "ETB",
//         }).format(amount);

//       const formatDate = (dateString) =>
//         !dateString
//           ? "N/A"
//           : new Date(dateString).toLocaleDateString("en-US", {
//               year: "numeric",
//               month: "short",
//               day: "numeric",
//             });

//       // Header Banner
//       page.drawRectangle({
//         x: 0,
//         y: height - 100,
//         width,
//         height: 100,
//         color: rgb(0.12, 0.35, 0.75),
//       });

//       addText(
//         "BSGC Procurement",
//         0,
//         height - 60,
//         20,
//         true,
//         rgb(1, 1, 1),
//         "center"
//       );
//       addText(
//         "Procurement Order Summary",
//         0,
//         height - 80,
//         12,
//         false,
//         rgb(1, 1, 1),
//         "center"
//       );

//       y -= 120;

//       // Order Info Box
//       page.drawRectangle({
//         x: 50,
//         y: y - 90,
//         width: width - 100,
//         height: 90,
//         color: rgb(0.96, 0.97, 0.99),
//       });

//       addText(`Order ID: #${order.id}`, 60, y - 20, 11);
//       addText(`Issued: ${formatDate(order.created_at)}`, 60, y - 40, 11);
//       addText(
//         `Supplier: ${this.capitalizeWords(order.suppliers?.name)}`,
//         60,
//         y - 60,
//         11
//       );
//       addText(
//         `Expected Delivery: ${formatDate(order.expected_delivery)}`,
//         60,
//         y - 80,
//         11
//       );
//       y -= 120;

//       // Material Section
//       addText(
//         "MATERIAL INFORMATION",
//         0,
//         y,
//         14,
//         true,
//         rgb(0.1, 0.25, 0.55),
//         "center"
//       );
//       y -= 25;

//       page.drawRectangle({
//         x: 50,
//         y: y - 20,
//         width: width - 100,
//         height: 20,
//         color: rgb(0.9, 0.92, 0.95),
//       });

//       addText("Material", 60, y - 5, 11, true);
//       addText("Quantity", 250, y - 5, 11, true);
//       addText("Unit Price", 370, y - 5, 11, true);
//       addText("Total", 470, y - 5, 11, true);

//       y -= 35;

//       const materialName =
//         this.capitalizeWords(order.master_materials?.name) || "N/A";

//       addText(materialName, 60, y, 10);
//       addText(
//         `${order.quantity} ${order.master_materials?.unit || ""}`,
//         250,
//         y,
//         10
//       );
//       addText(formatCurrency(order.unit_cost), 370, y, 10);
//       addText(formatCurrency(order.total_cost), 470, y, 10);

//       y -= 40;

//       // Total Highlight
//       page.drawRectangle({
//         x: 350,
//         y: y - 30,
//         width: 200,
//         height: 30,
//         color: rgb(0.12, 0.35, 0.75),
//       });
//       addText("GRAND TOTAL:", 360, y - 12, 12, true, rgb(1, 1, 1));
//       addText(
//         formatCurrency(order.total_cost),
//         470,
//         y - 12,
//         12,
//         true,
//         rgb(1, 1, 1)
//       );

//       y -= 70;

//       // Terms & Conditions
//       addText(
//         "TERMS & CONDITIONS",
//         0,
//         y,
//         14,
//         true,
//         rgb(0.1, 0.25, 0.55),
//         "center"
//       );
//       y -= 25;

//       const terms = [
//         "1. Delivery must be made by the expected date.",
//         "2. Materials must meet the quality standards.",
//         "3. Include proper documentation with delivery.",
//         "4. Payment after satisfactory inspection.",
//         "5. Delays must be communicated in advance.",
//       ];
//       terms.forEach((term) => {
//         addText(term, 60, y, 9);
//         y -= 14;
//       });

//       y -= 30;
//       addText(
//         `Generated on ${new Date().toLocaleDateString()} • BSGC Procurement`,
//         0,
//         y,
//         8,
//         false,
//         rgb(0.4, 0.4, 0.4),
//         "center"
//       );

//       // Return buffer
//       const pdfBytes = await pdfDoc.save();
//       return Buffer.from(pdfBytes);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       throw error;
//     }
//   }

//   // ✅ Modern Email HTML using Poppins
//   static generateEmailHTML(order) {
//     const formatDate = (dateString) =>
//       !dateString ? "N/A" : new Date(dateString).toLocaleDateString();

//     const formatCurrency = (amount) =>
//       new Intl.NumberFormat("en-ET", {
//         style: "currency",
//         currency: "ETB",
//       }).format(amount);

//     const materialName = this.capitalizeWords(order.master_materials?.name);
//     const supplierName = this.capitalizeWords(order.suppliers?.name);

//     return `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta charset="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <title>Procurement Order #${order.id}</title>
//         <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
//         <style>
//           body {
//             font-family: 'Poppins', sans-serif;
//             background: #f9fafb;
//             margin: 0;
//             padding: 0;
//             color: #1e293b;
//           }
//           .container {
//             max-width: 700px;
//             margin: 40px auto;
//             background: white;
//             border-radius: 16px;
//             box-shadow: 0 10px 25px rgba(0,0,0,0.08);
//             overflow: hidden;
//           }
//           .header {
//             background: linear-gradient(135deg, #1e3a8a, #2563eb);
//             color: white;
//             text-align: center;
//             padding: 40px 20px;
//           }
//           .header h1 {
//             margin: 0;
//             font-size: 26px;
//             font-weight: 700;
//           }
//           .header p {
//             margin: 5px 0 0;
//             font-size: 14px;
//           }
//           .content {
//             padding: 40px 30px;
//           }
//           .section-title {

//             font-weight: 600;
//             color: #1e3a8a;
//             margin-bottom: 16px;
//             font-size: 16px;
//             border-left: 4px solid #3b82f6;
//             padding-left: 10px;
//           }
//           .detail-row {
//             display: flex;
//             justify-content: space-between;
//             font-size: 14px;
//             margin-bottom: 8px;
//           }
//           .detail-label {
//             color: #64748b;
//             font-weight: 500;
//           }
//           .detail-value {
//             font-weight: 600;
//           }
//           .total {
//             text-align: right;
//             background: #1e3a8a;
//             color: white;
//             padding: 16px;
//             border-radius: 10px;
//             margin-top: 20px;
//           }
//           .footer {
//             text-align: center;
//             font-size: 12px;
//             color: #94a3b8;
//             margin-top: 30px;
//             padding-top: 20px;
//             border-top: 1px solid #e2e8f0;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>Procurement Order #${order.id}</h1>
//             <p>Issued: ${formatDate(order.created_at)}</p>
//           </div>
//           <div class="content">
//             <div class="section-title">Order Summary</div>
//             <div class="detail-row"><span class="detail-label">Supplier:</span><span class="detail-value">${supplierName}</span></div>
//             <div class="detail-row"><span class="detail-label">Material:</span><span class="detail-value">${materialName}</span></div>
//             <div class="detail-row"><span class="detail-label">Quantity:</span><span class="detail-value">${
//               order.quantity
//             } ${order.master_materials?.unit}</span></div>
//             <div class="detail-row"><span class="detail-label">Unit Price:</span><span class="detail-value">${formatCurrency(
//               order.unit_cost
//             )}</span></div>
//             <div class="total">
//               <div>Total Amount</div>
//               <div style="font-size:20px;font-weight:700;">${formatCurrency(
//                 order.total_cost
//               )}</div>
//             </div>
//             <div class="section-title" style="margin-top:30px;">Terms & Conditions</div>
//             <p style="font-size:13px;line-height:1.6;color:#475569;">
//               1. Delivery by expected date.<br>
//               2. Materials must meet standards.<br>
//               3. Documentation required.<br>
//               4. Payment upon satisfactory delivery.<br>
//               5. Communicate any delays in advance.
//             </p>
//             <div class="footer">
//               This is an automatically generated procurement order.<br/>
//               © ${new Date().getFullYear()} BSGC Procurement
//             </div>
//           </div>
//         </div>
//       </body>
//     </html>`;
//   }
// }

// export default EmailService;
import fs from "fs";
import path from "path";
import { Resend } from "resend";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendProcurementOrderEmail(order, supplierEmail) {
    try {
      // Generate PDF buffer
      const pdfBuffer = await this.generatePDF(order);

      // Convert buffer to base64 for email attachment
      const pdfBase64 = pdfBuffer.toString("base64");

      const { data, error } = await resend.emails.send({
        from: "BSGC Procurement <sales@zantex.store>",
        to: [supplierEmail],
        subject: `Procurement Order #${order.id} - ${this.capitalizeWords(
          order.master_materials?.name
        )}`,
        html: this.generateEmailHTML(order),
        attachments: [
          {
            filename: `procurement-order-${order.id}.pdf`,
            content: pdfBase64,
          },
        ],
      });

      if (error) {
        console.error("Error sending email:", error);
        throw error;
      }

      console.log("Email sent successfully:", data);
      return data;
    } catch (error) {
      console.error("Error in sendProcurementOrderEmail:", error);
      throw error;
    }
  }

  static capitalizeWords(str) {
    if (!str) return "";
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  static async generatePDF(order) {
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // Load Poppins font from /public/fonts
      const fontPath = path.resolve("./public/fonts/Poppins-Regular.ttf");
      const fontBytes = fs.readFileSync(fontPath);
      const poppins = await pdfDoc.embedFont(fontBytes);

      // A4 size
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();
      let y = height - 60;

      // Helper functions
      const addText = (
        text,
        x,
        y,
        size = 11,
        bold = false,
        color = rgb(0.1, 0.1, 0.1),
        align = "left"
      ) => {
        const textWidth = poppins.widthOfTextAtSize(text, size);
        const xPos =
          align === "center"
            ? (width - textWidth) / 2
            : align === "right"
            ? width - textWidth - x
            : x;
        page.drawText(text, { x: xPos, y, size, font: poppins, color });
      };

      const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-ET", {
          style: "currency",
          currency: "ETB",
        }).format(amount);

      const formatDate = (dateString) =>
        !dateString
          ? "N/A"
          : new Date(dateString).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

      // Header Banner
      page.drawRectangle({
        x: 0,
        y: height - 100,
        width,
        height: 100,
        color: rgb(0.12, 0.35, 0.75),
      });

      addText(
        "BSGC Procurement",
        0,
        height - 60,
        20,
        true,
        rgb(1, 1, 1),
        "center"
      );
      addText(
        "Procurement Order Summary",
        0,
        height - 80,
        12,
        false,
        rgb(1, 1, 1),
        "center"
      );

      y -= 120;

      // Order Info Box
      page.drawRectangle({
        x: 50,
        y: y - 90,
        width: width - 100,
        height: 90,
        color: rgb(0.96, 0.97, 0.99),
      });

      addText(`Order ID: #${order.id}`, 60, y - 20, 11);
      addText(`Issued: ${formatDate(order.created_at)}`, 60, y - 40, 11);
      addText(
        `Supplier: ${this.capitalizeWords(order.suppliers?.name)}`,
        60,
        y - 60,
        11
      );
      addText(
        `Expected Delivery: ${formatDate(order.expected_delivery)}`,
        60,
        y - 80,
        11
      );
      y -= 120;

      // Material Section
      addText(
        "MATERIAL INFORMATION",
        0,
        y,
        14,
        true,
        rgb(0.1, 0.25, 0.55),
        "center"
      );
      y -= 25;

      page.drawRectangle({
        x: 50,
        y: y - 20,
        width: width - 100,
        height: 20,
        color: rgb(0.9, 0.92, 0.95),
      });

      addText("Material", 60, y - 5, 11, true);
      addText("Quantity", 250, y - 5, 11, true);
      addText("Unit Price", 370, y - 5, 11, true);
      addText("Total", 470, y - 5, 11, true);

      y -= 35;

      const materialName =
        this.capitalizeWords(order.master_materials?.name) || "N/A";

      addText(materialName, 60, y, 10);
      addText(
        `${order.quantity} ${order.master_materials?.unit || ""}`,
        250,
        y,
        10
      );
      addText(formatCurrency(order.unit_cost), 370, y, 10);
      addText(formatCurrency(order.total_cost), 470, y, 10);

      y -= 40;

      // Total Highlight
      page.drawRectangle({
        x: 350,
        y: y - 30,
        width: 200,
        height: 30,
        color: rgb(0.12, 0.35, 0.75),
      });
      addText("GRAND TOTAL:", 360, y - 12, 12, true, rgb(1, 1, 1));
      addText(
        formatCurrency(order.total_cost),
        470,
        y - 12,
        12,
        true,
        rgb(1, 1, 1)
      );

      y -= 70;

      // Terms & Conditions
      addText(
        "TERMS & CONDITIONS",
        0,
        y,
        14,
        true,
        rgb(0.1, 0.25, 0.55),
        "center"
      );
      y -= 25;

      const terms = [
        "1. Delivery must be made by the expected date.",
        "2. Materials must meet the quality standards.",
        "3. Include proper documentation with delivery.",
        "4. Payment after satisfactory inspection.",
        "5. Delays must be communicated in advance.",
      ];
      terms.forEach((term) => {
        addText(term, 60, y, 9);
        y -= 14;
      });

      y -= 30;
      addText(
        `Generated on ${new Date().toLocaleDateString()} • BSGC Procurement`,
        0,
        y,
        8,
        false,
        rgb(0.4, 0.4, 0.4),
        "center"
      );

      // Return buffer
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  static generateEmailHTML(order) {
    const formatDate = (dateString) =>
      !dateString ? "N/A" : new Date(dateString).toLocaleDateString();

    const formatCurrency = (amount) =>
      new Intl.NumberFormat("en-ET", {
        style: "currency",
        currency: "ETB",
      }).format(amount);

    const materialName = this.capitalizeWords(order.master_materials?.name);
    const supplierName = this.capitalizeWords(order.suppliers?.name);

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Procurement Order #${order.id}</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Poppins', sans-serif;
            background: #f9fafb;
            margin: 0;
            padding: 0;
            color: #1e293b;
          }
          .container {
            max-width: 700px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1e3a8a, #2563eb);
            color: white;
            text-align: center;
            padding: 40px 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
          }
          .header p {
            margin: 5px 0 0;
            font-size: 14px;
          }
          .content {
            padding: 40px 30px;
          }
          .section-title {
            font-weight: 600;
            color: #1e3a8a;
            margin-bottom: 16px;
            font-size: 16px;
            border-left: 4px solid #3b82f6;
            padding-left: 10px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .detail-label {
            color: #64748b;
            font-weight: 500;
          }
          .detail-value {
            font-weight: 600;
          }
          .total {
            text-align: right;
            background: #1e3a8a;
            color: white;
            padding: 16px;
            border-radius: 10px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Procurement Order #${order.id}</h1>
            <p>Issued: ${formatDate(order.created_at)}</p>
          </div>
          <div class="content">
            <div class="section-title">Order Summary</div>
            <div class="detail-row"><span class="detail-label">Supplier:</span><span class="detail-value">${supplierName}</span></div>
            <div class="detail-row"><span class="detail-label">Material:</span><span class="detail-value">${materialName}</span></div>
            <div class="detail-row"><span class="detail-label">Quantity:</span><span class="detail-value">${
              order.quantity
            } ${order.master_materials?.unit}</span></div>
            <div class="detail-row"><span class="detail-label">Unit Price:</span><span class="detail-value">${formatCurrency(
              order.unit_cost
            )}</span></div>
            <div class="total">
              <div>Total Amount</div>
              <div style="font-size:20px;font-weight:700;">${formatCurrency(
                order.total_cost
              )}</div>
            </div>
            <div class="section-title" style="margin-top:30px;">Terms & Conditions</div>
            <p style="font-size:13px;line-height:1.6;color:#475569;">
              1. Delivery by expected date.<br>
              2. Materials must meet standards.<br>
              3. Documentation required.<br>
              4. Payment upon satisfactory delivery.<br>
              5. Communicate any delays in advance.
            </p>
            <div class="footer">
              This is an automatically generated procurement order.<br/>
              © ${new Date().getFullYear()} BSGC Procurement
            </div>
          </div>
        </div>
      </body>
    </html>`;
  }
}

export default EmailService;
