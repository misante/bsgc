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
      let y = height - 50;

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

      // Try to load and embed company logo
      try {
        const logoPath = path.resolve("./public/images/logo.png");
        if (fs.existsSync(logoPath)) {
          const logoBytes = fs.readFileSync(logoPath);
          const logoImage = await pdfDoc.embedPng(logoBytes);
          const logoDims = logoImage.scale(0.15); // Adjust scale as needed

          // Draw logo at top center
          page.drawImage(logoImage, {
            x: (width - logoDims.width) / 2,
            y: height - 80,
            width: logoDims.width,
            height: logoDims.height,
          });

          y -= logoDims.height + 20; // Adjust Y position after logo
        }
      } catch (logoError) {
        console.log("Logo not found, proceeding without it");
        // If logo doesn't exist, we'll just use text
      }

      // Header Banner (only if no logo was added, or smaller banner)
      page.drawRectangle({
        x: 0,
        y: y - 40,
        width,
        height: 40,
        color: rgb(0.12, 0.35, 0.75),
      });

      addText("BSGC Procurement", 0, y - 20, 16, true, rgb(1, 1, 1), "center");
      addText(
        "Procurement Order Summary",
        0,
        y - 35,
        10,
        false,
        rgb(1, 1, 1),
        "center"
      );

      y -= 70;

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
      !dateString
        ? "N/A"
        : new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          margin: 0;
          padding: 20px;
          color: #334155;
          line-height: 1.6;
        }
        .email-container {
          max-width: 680px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.08),
            0 8px 16px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 50px 40px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="rgba(255,255,255,0.05)"><polygon points="0,0 1000,50 1000,100 0,100"/></svg>');
          background-size: cover;
        }
        .header-content {
          position: relative;
          z-index: 2;
        }
        .company-name {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .order-title {
          font-size: 32px;
          font-weight: 700;
          margin: 16px 0 8px;
          letter-spacing: -0.5px;
        }
        .order-subtitle {
          font-size: 16px;
          font-weight: 400;
          opacity: 0.9;
        }
        .content {
          padding: 50px 40px;
        }
        .section {
          margin-bottom: 40px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-title::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          border-radius: 2px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }
        .info-label {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }
        .material-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          margin: 20px 0;
        }
        .material-table th {
          background: #f8fafc;
          padding: 16px 20px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
        }
        .material-table td {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }
        .material-name {
          font-weight: 600;
          color: #1e293b;
        }
        .total-section {
          background: linear-gradient(135deg, #1e3a8a, #3730a3);
          color: white;
          padding: 30px;
          border-radius: 16px;
          text-align: center;
          margin: 30px 0;
        }
        .total-label {
          font-size: 14px;
          font-weight: 500;
          opacity: 0.9;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .total-amount {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .terms-section {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 24px;
          margin: 30px 0;
        }
        .terms-title {
          font-size: 16px;
          font-weight: 600;
          color: #0369a1;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .terms-list {
          list-style: none;
          padding: 0;
        }
        .terms-list li {
          padding: 12px 0;
          font-size: 14px;
          color: #0c4a6e;
          position: relative;
          padding-left: 32px;
          border-bottom: 1px solid #e0f2fe;
        }
        .terms-list li:last-child {
          border-bottom: none;
        }
        .terms-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 14px;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        }
        .terms-list li:nth-child(1)::before { content: '1'; }
        .terms-list li:nth-child(2)::before { content: '2'; }
        .terms-list li:nth-child(3)::before { content: '3'; }
        .terms-list li:nth-child(4)::before { content: '4'; }
        .terms-list li:nth-child(5)::before { content: '5'; }
        .footer {
          text-align: center;
          padding: 30px 40px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 13px;
        }
        .footer p {
          margin: 4px 0;
        }
        .contact-info {
          margin-top: 16px;
          font-size: 12px;
          opacity: 0.8;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .header {
            padding: 40px 20px 30px;
          }
          .content {
            padding: 30px 20px;
          }
          .info-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          .order-title {
            font-size: 24px;
          }
          .total-amount {
            font-size: 24px;
          }
          .terms-list li {
            padding-left: 28px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="header-content">
            <div class="company-name">BSGC PROCUREMENT</div>
            <h1 class="order-title">Procurement Order #${order.id}</h1>
            <p class="order-subtitle">Issued on ${formatDate(
              order.created_at
            )}</p>
          </div>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">Order Details</div>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-label">Supplier</div>
                <div class="info-value">${supplierName}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Expected Delivery</div>
                <div class="info-value">${formatDate(
                  order.expected_delivery
                )}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Material Information</div>
            <table class="material-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="material-name">${materialName}</td>
                  <td>${order.quantity} ${
      order.master_materials?.unit || ""
    }</td>
                  <td>${formatCurrency(order.unit_cost)}</td>
                  <td><strong>${formatCurrency(order.total_cost)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div class="total-label">Grand Total Amount</div>
            <div class="total-amount">${formatCurrency(order.total_cost)}</div>
          </div>

          <div class="section">
            <div class="section-title">Terms & Conditions</div>
            <div class="terms-section">
              <div class="terms-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Important Requirements
              </div>
              <ul class="terms-list">
                <li>Delivery must be completed by the expected delivery date specified above</li>
                <li>All materials must meet BSGC quality standards and specifications</li>
                <li>Proper documentation including certificates and invoices must accompany delivery</li>
                <li>Payment will be processed after satisfactory inspection and verification</li>
                <li>Any potential delays must be communicated in writing at least 48 hours in advance</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>BSGC Procurement Department</strong></p>
          <p>This is an automatically generated procurement order. Please review the attached PDF for complete details.</p>
          <div class="contact-info">
            For inquiries, please contact procurement@bsgc.et • +251 XXX XXX XXX
          </div>
          <p style="margin-top: 16px;">© ${new Date().getFullYear()} BSGC. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>`;
  }
}

export default EmailService;
