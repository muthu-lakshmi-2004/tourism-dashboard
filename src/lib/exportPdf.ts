import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { dashboardSummary } from "../data/mockData";

export function exportDashboardPdf() {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Operations Sanctuary — Summary Report", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`, 14, 30);

  doc.setTextColor(40);
  doc.setFontSize(14);
  doc.text("Dashboard Overview", 14, 44);

  autoTable(doc, {
    startY: 50,
    head: [["Metric", "Value", "Trend"]],
    body: [
      ["Total Guests", dashboardSummary.totalGuests.toLocaleString("en-IN"), `${dashboardSummary.guestsTrend}%`],
      ["Total Revenue", `₹${(dashboardSummary.totalRevenue / 100000).toFixed(1)}L`, `${dashboardSummary.revenueTrend}%`],
      ["Total Expenses", `₹${(dashboardSummary.totalExpenses / 100000).toFixed(1)}L`, `${dashboardSummary.expensesTrend}%`],
    ],
    theme: "grid",
    headStyles: { fillColor: [200, 150, 50] },
  });

  doc.save("operations-sanctuary-report.pdf");
}
