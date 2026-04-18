import { DashboardLayout } from "../components/DashboardLayout";
import { DataEntrySheet } from "../components/DataEntrySheet";
import { nineIslandYoY } from "../data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const COLORS = ["hsl(32, 70%, 50%)", "hsl(42, 50%, 72%)", "hsl(35, 15%, 88%)"];

const yoyChartData = nineIslandYoY.current.map((c, i) => ({
  month: c.month,
  current: c.guests,
  previous: nineIslandYoY.previous[i].guests,
}));

export default function NineIslandPage() {
  const [notes, setNotes] = useState(nineIslandYoY.significantPoints);

  const totalCurrent = nineIslandYoY.current.reduce((a, b) => a + b.guests, 0);
  const totalPrevious = nineIslandYoY.previous.reduce((a, b) => a + b.guests, 0);
  const yoyGrowth = (((totalCurrent - totalPrevious) / totalPrevious) * 100).toFixed(1);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-medium">Nine Island Tour</h1>
            <p className="text-muted-foreground mt-1">Year-on-Year analysis of tour performance</p>
          </div>
          <DataEntrySheet
            title="Add Tour Entry"
            fields={[
              { name: "month", label: "Month" },
              { name: "tours", label: "Tours Booked", type: "number" },
              { name: "guests", label: "Guest Count", type: "number" },
              { name: "value", label: "Total Value (₹)", type: "number" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Guests (Current)", value: totalCurrent.toLocaleString("en-IN") },
            { label: "Total Guests (Previous)", value: totalPrevious.toLocaleString("en-IN") },
            { label: "YoY Growth", value: `${yoyGrowth}%` },
          ].map((m) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow"
            >
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-3xl font-display font-medium tabular-nums mt-1">{m.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow"
          >
            <h2 className="font-display text-lg font-medium mb-4">Guest Count — YoY Comparison</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={yoyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 46%)" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(35,15%,88%)", boxShadow: "0 4px 20px -2px hsl(30 15% 18% / 0.05)" }}
                />
                <Line type="monotone" dataKey="current" stroke="hsl(32, 70%, 50%)" strokeWidth={2} name="Current Year" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="previous" stroke="hsl(35, 15%, 88%)" strokeWidth={2} name="Previous Year" dot={{ r: 3 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow"
          >
            <h2 className="font-display text-lg font-medium mb-4">Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={nineIslandYoY.expenses} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => `${e.name}: ₹${(e.value / 1000).toFixed(0)}K`}>
                  {nineIslandYoY.expenses.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              {nineIslandYoY.expenses.map((e, i) => (
                <div key={e.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {e.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow"
        >
          <h2 className="font-display text-lg font-medium mb-3">Significant Points</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px] rounded-md bg-secondary/30 border-border/50 resize-none"
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
