import { DashboardLayout } from "../components/DashboardLayout";
import { DataEntrySheet } from "../components/DataEntrySheet";
import { accommodation } from "../data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function AccommodationPage() {
  const chartData = accommodation.categories.map((c) => ({
    type: c.type,
    Revenue: c.value / 1000,
    Maintenance: c.maintenance / 1000,
  }));

  const totalValue = accommodation.categories.reduce((a, b) => a + b.value, 0);
  const totalMaintenance = accommodation.categories.reduce((a, b) => a + b.maintenance, 0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-medium">Accommodation</h1>
            <p className="text-muted-foreground mt-1">A/C & Non-A/C room booking reports</p>
          </div>
          <DataEntrySheet
            title="Add Booking Entry"
            fields={[
              { name: "type", label: "Room Type (A/C or Non-A/C)" },
              { name: "booked", label: "Rooms Booked", type: "number" },
              { name: "value", label: "Total Value (₹)", type: "number" },
              { name: "maintenance", label: "Maintenance Cost (₹)", type: "number" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow">
            <p className="text-sm text-muted-foreground">Total Booking Revenue</p>
            <p className="text-3xl font-display font-medium tabular-nums mt-1">₹{(totalValue / 100000).toFixed(1)}L</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow">
            <p className="text-sm text-muted-foreground">Total Maintenance</p>
            <p className="text-3xl font-display font-medium tabular-nums mt-1">₹{(totalMaintenance / 100000).toFixed(1)}L</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow">
            <h2 className="font-display text-lg font-medium mb-4">Revenue vs Maintenance (₹K)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 88%)" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 46%)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(35,15%,88%)" }} />
                <Bar dataKey="Revenue" fill="hsl(32, 70%, 50%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Maintenance" fill="hsl(42, 50%, 72%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow">
            <h2 className="font-display text-lg font-medium mb-4">Room Details</h2>
            <div className="space-y-4">
              {accommodation.categories.map((cat) => {
                const occupancy = ((cat.booked / cat.total) * 100).toFixed(0);
                return (
                  <div key={cat.type} className="bg-secondary/30 rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{cat.type}</span>
                      <span className="text-sm text-muted-foreground">{occupancy}% booked</span>
                    </div>
                    <div className="w-full bg-border/50 rounded-full h-2 mb-3">
                      <div className="bg-primary h-2 rounded-full transition-all duration-700" style={{ width: `${occupancy}%` }} />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{cat.booked} / {cat.total} rooms</span>
                      <span>₹{(cat.value / 100000).toFixed(1)}L revenue</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
