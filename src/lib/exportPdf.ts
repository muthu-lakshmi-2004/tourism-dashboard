import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DashboardData {
  totalGuests: number;
  totalRevenue: number;
  totalExpenses: number;
  guestsTrend: number;
  revenueTrend: number;
  expensesTrend: number;
  depts: {
    name: string;
    guests: number;
    revenue: number;
    expenses: number;
  }[];
}

export function exportDashboardPdf(data: DashboardData) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text("Operations Sanctuary — Summary Report", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`, 14, 30);

  // Dashboard Overview
  doc.setTextColor(40);
  doc.setFontSize(14);
  doc.text("Dashboard Overview", 14, 44);

  autoTable(doc, {
    startY: 50,
    head: [["Metric", "Value", "Trend"]],
    body: [
      [
        "Total Guests",
        data.totalGuests.toLocaleString("en-IN"),
        data.guestsTrend !== 0 ? `${data.guestsTrend}%` : "—",
      ],
      [
        "Total Revenue",
        `Rs.${(data.totalRevenue / 100000).toFixed(1)}L`,
        data.revenueTrend !== 0 ? `${data.revenueTrend}%` : "—",
      ],
      [
        "Total Expenses",
        `Rs.${(data.totalExpenses / 100000).toFixed(1)}L`,
        data.expensesTrend !== 0 ? `${data.expensesTrend}%` : "—",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [200, 150, 50] },
    styles: { fontSize: 11 },
  });

  // Department Breakdown
  const afterOverview = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(14);
  doc.text("Department Breakdown", 14, afterOverview);

  autoTable(doc, {
    startY: afterOverview + 6,
    head: [["Department", "Guests", "Revenue", "Expenses"]],
    body: data.depts.map((d) => [
      d.name,
      d.guests.toLocaleString("en-IN"),
      `Rs.${(d.revenue / 100000).toFixed(1)}L`,
      `Rs.${(d.expenses / 100000).toFixed(1)}L`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [200, 150, 50] },
    styles: { fontSize: 11 },
  });

  doc.save("operations-sanctuary-report.pdf");
}