import { DashboardLayout } from "../components/DashboardLayout";
import { DataEntrySheet } from "../components/DataEntrySheet";
import { ProgressRing } from "../components/ProgressRing";
import { roomOccupancy } from "../data/mockData";
import { motion } from "framer-motion";

export default function OccupancyPage() {
  const totalRevenue = roomOccupancy.blocks.reduce((a, b) => a + b.revenue, 0);
  const totalOccupied = roomOccupancy.blocks.reduce((a, b) => a + b.occupied, 0);
  const totalRooms = roomOccupancy.blocks.reduce((a, b) => a + b.totalRooms, 0);
  const avgOccupancy = ((totalOccupied / totalRooms) * 100).toFixed(0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-medium">Room Occupancy</h1>
            <p className="text-muted-foreground mt-1">Isodyan & MTC block occupancy details</p>
          </div>
          <DataEntrySheet
            title="Update Occupancy"
            fields={[
              { name: "block", label: "Block Name" },
              { name: "occupied", label: "Rooms Occupied", type: "number" },
              { name: "revenue", label: "Revenue (₹)", type: "number" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow">
            <p className="text-sm text-muted-foreground">Average Occupancy</p>
            <p className="text-3xl font-display font-medium tabular-nums mt-1">{avgOccupancy}%</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow">
            <p className="text-sm text-muted-foreground">Total Rooms Occupied</p>
            <p className="text-3xl font-display font-medium tabular-nums mt-1">{totalOccupied} / {totalRooms}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-display font-medium tabular-nums mt-1">₹{(totalRevenue / 100000).toFixed(1)}L</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow mb-8"
        >
          <h2 className="font-display text-lg font-medium mb-6">Occupancy by Block</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            {roomOccupancy.blocks.map((block) => {
              const pct = Math.round((block.occupied / block.totalRooms) * 100);
              return (
                <ProgressRing key={block.name} percentage={pct} label={block.name} size={110} strokeWidth={8} />
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow"
        >
          <h2 className="font-display text-lg font-medium mb-4">Detailed Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Block</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Total Rooms</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Occupied</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Occupancy %</th>
                  <th className="text-right py-3 px-3 text-muted-foreground font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {roomOccupancy.blocks.map((block) => (
                  <tr key={block.name} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-3 font-medium">{block.name}</td>
                    <td className="py-4 px-3 text-right tabular-nums">{block.totalRooms}</td>
                    <td className="py-4 px-3 text-right tabular-nums">{block.occupied}</td>
                    <td className="py-4 px-3 text-right tabular-nums">{Math.round((block.occupied / block.totalRooms) * 100)}%</td>
                    <td className="py-4 px-3 text-right tabular-nums">₹{(block.revenue / 100000).toFixed(1)}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
