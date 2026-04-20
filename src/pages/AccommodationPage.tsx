import { useState, useMemo } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { DataEntrySheet } from "../components/DataEntrySheet";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiDetails from "../config/apiDetails";
import { format, subYears } from "date-fns";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { Booking } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccommodationCategory {
  type: string;
  booked: number;
  total: number;
  value: number;
  maintenance: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchAccommodationBookings(fromDate: string, toDate: string): Promise<Booking[]> {
  const response = await axios.post(
    `${apiDetails.baseUrl}${apiDetails.endPoint.accommodation}`,
    { start_date: fromDate, end_date: toDate },
    {
      params: { token: apiDetails.staticToken },
      headers: { "Content-Type": "application/json" },
    }
  );
  const raw = response.data;
  if (Array.isArray(raw))                   return raw as Booking[];
  if (raw?.data && Array.isArray(raw.data)) return raw.data as Booking[];
  return [];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCategories(bookings: Booking[]): AccommodationCategory[] {
  const acBookings = bookings.filter((b) => {
    const desc = (b.description || b.GHD || "").toLowerCase();
    return desc.includes("ac") && !desc.includes("non ac") && !desc.includes("non-ac");
  });

  const nonAcBookings = bookings.filter((b) => {
    const desc = (b.description || b.GHD || "").toLowerCase();
    return desc.includes("non ac") || desc.includes("non-ac");
  });

  const totalAcRooms    = acBookings.reduce((sum, b)    => sum + parseInt(b.rooms || "1", 10), 0);
  const totalNonAcRooms = nonAcBookings.reduce((sum, b) => sum + parseInt(b.rooms || "1", 10), 0);

  return [
    {
      type:        "A/C Rooms",
      booked:      totalAcRooms,
      total:       Math.max(totalAcRooms, 1800),
      value:       totalAcRooms * 1500,
      maintenance: totalAcRooms * 120,
    },
    {
      type:        "Non-A/C Rooms",
      booked:      totalNonAcRooms,
      total:       Math.max(totalNonAcRooms, 1200),
      value:       totalNonAcRooms * 750,
      maintenance: totalNonAcRooms * 60,
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccommodationPage() {
  const today      = new Date();
  const oneYearAgo = subYears(today, 1);

  const [fromDate, setFromDate] = useState(format(oneYearAgo, "yyyy-MM-dd"));
  const [toDate,   setToDate]   = useState(format(today,      "yyyy-MM-dd"));

  const { data: bookings = [], isLoading, isError, error } = useQuery<Booking[], Error>({
    queryKey: ["accommodation", fromDate, toDate],
    queryFn:  () => fetchAccommodationBookings(fromDate, toDate),
    retry: 1,
  });

  const categories = useMemo(() => buildCategories(bookings), [bookings]);

  const totalValue       = categories.reduce((a, b) => a + b.value,       0);
  const totalMaintenance = categories.reduce((a, b) => a + b.maintenance, 0);

  const chartData = categories.map((c) => ({
    type:        c.type,
    Revenue:     Math.round(c.value       / 1000),
    Maintenance: Math.round(c.maintenance / 1000),
  }));

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-[16px] px-5 py-3 mb-6 ceramic-shadow flex items-center gap-4"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-border/60 rounded-lg px-3 py-1.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">To</label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-border/60 rounded-lg px-3 py-1.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums"
            />
          </div>

          <div className="flex-1" />

          <button
            onClick={() => {
              setFromDate(format(oneYearAgo, "yyyy-MM-dd"));
              setToDate(format(today, "yyyy-MM-dd"));
            }}
            className="ml-auto text-xs text-primary underline underline-offset-2 hover:opacity-75 whitespace-nowrap"
          >
            Reset
          </button>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading bookings…</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-[12px] p-4 mb-6 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load data: {(error as Error)?.message ?? "Unknown error"}</span>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-display font-medium">Accommodation</h1>
                <p className="text-muted-foreground mt-1">A/C &amp; Non-A/C room booking reports</p>
              </div>
              <DataEntrySheet
                title="Add Booking Entry"
                fields={[
                  { name: "type",        label: "Room Type (A/C or Non-A/C)" },
                  { name: "booked",      label: "Rooms Booked",        type: "number" },
                  { name: "value",       label: "Total Value (₹)",     type: "number" },
                  { name: "maintenance", label: "Maintenance Cost (₹)", type: "number" },
                ]}
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow"
              >
                <p className="text-sm text-muted-foreground">Total Booking Revenue</p>
                <p className="text-3xl font-display font-medium tabular-nums mt-1">
                  ₹{(totalValue / 100000).toFixed(1)}L
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow"
              >
                <p className="text-sm text-muted-foreground">Total Maintenance</p>
                <p className="text-3xl font-display font-medium tabular-nums mt-1">
                  ₹{(totalMaintenance / 100000).toFixed(1)}L
                </p>
              </motion.div>
            </div>

            {/* Charts + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow"
              >
                <h2 className="font-display text-lg font-medium mb-4">Revenue vs Maintenance (₹K)</h2>
                {categories.length === 0 ? (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    No data for selected period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 88%)" />
                      <XAxis dataKey="type" tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 46%)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 46%)" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(35,15%,88%)" }} />
                      <Bar dataKey="Revenue"     fill="hsl(32, 70%, 50%)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Maintenance" fill="hsl(42, 50%, 72%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              {/* Room Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow"
              >
                <h2 className="font-display text-lg font-medium mb-4">Room Details</h2>
                {categories.length === 0 ? (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                    No room data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categories.map((cat) => {
                      const occupancy = Math.min(100, Math.round((cat.booked / cat.total) * 100));
                      return (
                        <div key={cat.type} className="bg-secondary/30 rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{cat.type}</span>
                            <span className="text-sm text-muted-foreground">{occupancy}% booked</span>
                          </div>
                          <div className="w-full bg-border/50 rounded-full h-2 mb-3">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-700"
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{cat.booked} / {cat.total} rooms</span>
                            <span>₹{(cat.value / 100000).toFixed(1)}L revenue</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}