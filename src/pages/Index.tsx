import { DashboardLayout } from "../components/DashboardLayout";
import { MetricCard } from "../components/MetricCard";
import { dashboardSummary } from "../data/mockData";
import { Users, IndianRupee, Receipt, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { exportDashboardPdf } from "@/lib/exportPdf";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.4 } },
};

const Index = () => {
  const formatCurrency = (v: number) => `₹${(v / 100000).toFixed(1)}L`;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-medium">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Tracking the flow of pilgrims and resources across the sacred islands.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportDashboardPdf} className="saffron-pulse gap-2">
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Export PDF
          </Button>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div variants={item}>
            <MetricCard
              title="Total Guests"
              value={dashboardSummary.totalGuests.toLocaleString("en-IN")}
              trend={dashboardSummary.guestsTrend}
              icon={<Users className="h-5 w-5" strokeWidth={1.5} />}
            />
          </motion.div>
          <motion.div variants={item}>
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(dashboardSummary.totalRevenue)}
              trend={dashboardSummary.revenueTrend}
              icon={<IndianRupee className="h-5 w-5" strokeWidth={1.5} />}
            />
          </motion.div>
          <motion.div variants={item}>
            <MetricCard
              title="Total Expenses"
              value={formatCurrency(dashboardSummary.totalExpenses)}
              trend={dashboardSummary.expensesTrend}
              icon={<Receipt className="h-5 w-5" strokeWidth={1.5} />}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow"
        >
          <h2 className="font-display text-xl font-medium mb-4">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: "Nine Island Tour", guests: "5,280", revenue: "₹38.8L" },
              { name: "Ganga Boat Ride", guests: "3,042", revenue: "₹12.4L" },
              { name: "Accommodation", guests: "2,130", revenue: "₹25.3L" },
              { name: "Transport", guests: "800", revenue: "₹8.7L" },
              { name: "Room Occupancy", guests: "1,595", revenue: "₹20.3L" },
            ].map((dept) => (
              <div key={dept.name} className="bg-secondary/50 rounded-md p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{dept.name}</p>
                <p className="font-display text-lg font-medium tabular-nums">{dept.revenue}</p>
                <p className="text-xs text-muted-foreground mt-1">{dept.guests} guests</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
