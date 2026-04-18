import { DashboardLayout } from "../components/DashboardLayout";
import { DataEntrySheet } from "../components/DataEntrySheet";
import { transport } from "../data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function TransportPage() {
  const chartData = transport.vehicles.map((v) => ({
    type: v.type,
    Income: v.income / 1000,
    Expense: v.expense / 1000,
  }));

  const totalIncome = transport.vehicles.reduce((a, b) => a + b.income, 0);
  const totalExpense = transport.vehicles.reduce((a, b) => a + b.expense, 0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-medium">Transport</h1>
            <p className="text-muted-foreground mt-1">Cars & buses booking ledger</p>
          </div>
          <DataEntrySheet
            title="Add Transport Entry"
            fields={[
              { name: "type", label: "Vehicle Type (Car/Bus)" },
              { name: "booked", label: "Vehicles Booked", type: "number" },
              { name: "income", label: "Income (₹)", type: "number" },
              { name: "expense", label: "Expense (₹)", type: "number" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow">
            <p className="text-sm text-muted-foreground">Total Income</p>
            <p className="text-3xl font-display font-medium tabular-nums mt-1">₹{(totalIncome / 100000).toFixed(1)}L</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow">
            <p className="text-sm text-muted-foreground">Total Expense</p>
            <p className="text-3xl font-display font-medium tabular-nums mt-1">₹{(totalExpense / 100000).toFixed(1)}L</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow">
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <p className="text-3xl font-display font-medium tabular-nums mt-1">₹{((totalIncome - totalExpense) / 100000).toFixed(1)}L</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow">
            <h2 className="font-display text-lg font-medium mb-4">Income vs Expense (₹K)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 88%)" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 46%)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(35,15%,88%)" }} />
                <Bar dataKey="Income" fill="hsl(32, 70%, 50%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="hsl(42, 50%, 72%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow">
            <h2 className="font-display text-lg font-medium mb-4">Vehicle Ledger</h2>
            <div className="space-y-4">
              {transport.vehicles.map((v) => {
                const profit = v.income - v.expense;
                const margin = ((profit / v.income) * 100).toFixed(0);
                return (
                  <div key={v.type} className="bg-secondary/30 rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-display text-lg font-medium">{v.type}</span>
                      <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">{margin}% margin</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Booked</p>
                        <p className="font-medium tabular-nums">{v.booked}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Income</p>
                        <p className="font-medium tabular-nums">₹{(v.income / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expense</p>
                        <p className="font-medium tabular-nums">₹{(v.expense / 1000).toFixed(0)}K</p>
                      </div>
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
