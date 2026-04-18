import { useState, useMemo } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { DataEntrySheet } from "../components/DataEntrySheet";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiDetails from "../config/apiDetails";
import { format, parse, isWithinInterval, startOfDay, endOfDay, subYears } from "date-fns";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { Booking, COLORS, ExpenseRow, RideDataRow} from "./types";


function parseBookingDate(dateStr: string): Date | null {
  try {
    return parse(dateStr, "dd-MMM-yyyy HH:mm:ss", new Date());
  } catch {
    return null;
  }
}

async function fetchBookings(fromDate: string, toDate: string): Promise<Booking[]> {
  const response = await axios.post(
    `${apiDetails.baseUrl}${apiDetails.endPoint.gangaBoatRide}`,
    { start_date: fromDate, end_date: toDate },
    {
      params: { token: apiDetails.staticToken },
      headers: { "Content-Type": "application/json" },
    }
  );
  const raw = response.data;
  if (Array.isArray(raw))                      return raw as Booking[];
  if (raw?.data && Array.isArray(raw.data))    return raw.data as Booking[];
  return [];
}

function toRideDataRows(bookings: Booking[]): RideDataRow[] {
  const map: Record<string, RideDataRow> = {};

  bookings.forEach((b) => {
    const d = parseBookingDate(b.start_dt);
    const label = d ? format(d, "MMM yyyy") : "Unknown";
    const pax = parseInt(b.no_people || "0", 10);
    const isPrivate = b.transport?.toLowerCase() !== "individual";

    if (!map[label]) {
      map[label] = {
        month: label,
        privateRides: 0, privatePax: 0, privateValue: 0,
        individualRides: 0, individualPax: 0, individualValue: 0,
      };
    }

    if (isPrivate) {
      map[label].privateRides += 1;
      map[label].privatePax  += pax;
      map[label].privateValue += pax * 3000;
    } else {
      map[label].individualRides += 1;
      map[label].individualPax  += pax;
      map[label].individualValue += pax * 150;
    }
  });

  return Object.values(map).sort((a, b) => {
    const da = parse(a.month, "MMM yyyy", new Date());
    const db = parse(b.month, "MMM yyyy", new Date());
    return da.getTime() - db.getTime();
  });
}

function toExpenseRows(bookings: Booking[]): ExpenseRow[] {
  const map: Record<string, number> = {};
  bookings.forEach((b) => {
    const t = b.transport || "Other";
    const pax = parseInt(b.no_people || "0", 10);
    map[t] = (map[t] || 0) + pax;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export default function GangaBoatPage() {
  const today       = new Date();
  const oneYearAgo  = subYears(today, 1);

  const [fromDate, setFromDate] = useState(format(oneYearAgo, "yyyy-MM-dd"));
  const [toDate,   setToDate]   = useState(format(today,      "yyyy-MM-dd"));

  const { data: bookings = [], isLoading, isError, error } = useQuery<Booking[], Error>({
    queryKey: ["gangaBoat", fromDate, toDate],
    queryFn:  () => fetchBookings(fromDate, toDate),
    retry: 1,
  });

  const filtered = useMemo(() => {
    if (!fromDate && !toDate) return bookings;
    return bookings.filter((b) => {
      const d = parseBookingDate(b.start_dt);
      if (!d) return true;
      const from = fromDate ? startOfDay(new Date(fromDate)) : null;
      const to   = toDate   ? endOfDay(new Date(toDate))     : null;
      if (from && to) return isWithinInterval(d, { start: from, end: to });
      if (from) return d >= from;
      if (to)   return d <= to;
      return true;
    });
  }, [bookings, fromDate, toDate]);

  const rideData   = useMemo(() => toRideDataRows(filtered), [filtered]);
  const expenses   = useMemo(() => toExpenseRows(filtered),  [filtered]);

  const totalPrivateValue    = rideData.reduce((a, b) => a + b.privateValue,    0);
  const totalIndividualValue = rideData.reduce((a, b) => a + b.individualValue, 0);

  const chartData = rideData.map((d) => ({
    month:      d.month,
    Private:    d.privateValue    / 1000,
    Individual: d.individualValue / 1000,
  }));

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4">

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-[16px] p-4 ceramic-shadow mb-6 flex flex-wrap items-center gap-3"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <label className="text-sm text-muted-foreground whitespace-nowrap">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-border/60 rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-auto"
            />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <label className="text-sm text-muted-foreground whitespace-nowrap">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-border/60 rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-auto"
            />
          </div>

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

        {isLoading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading bookings…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-[12px] p-4 mb-6 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load data: {(error as Error)?.message ?? "Unknown error"}</span>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-medium">Ganga Boat Ride</h1>
                <p className="text-muted-foreground mt-1 text-sm">Private &amp; individual ride tracking</p>
              </div>
              <DataEntrySheet
                title="Add Ride Entry"
                fields={[
                  { name: "month",           label: "Month" },
                  { name: "privateRides",    label: "Private Rides",        type: "number" },
                  { name: "privatePax",      label: "Private Pax",          type: "number" },
                  { name: "privateValue",    label: "Private Value (₹)",    type: "number" },
                  { name: "individualRides", label: "Individual Rides",     type: "number" },
                  { name: "individualPax",   label: "Individual Pax",       type: "number" },
                  { name: "individualValue", label: "Individual Value (₹)", type: "number" },
                ]}
              />
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow min-w-0"
              >
                <p className="text-sm text-muted-foreground">Private Rides Revenue</p>
                <p className="text-2xl sm:text-3xl font-display font-medium tabular-nums mt-1 truncate">
                  ₹{(totalPrivateValue / 100000).toFixed(1)}L
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow min-w-0"
              >
                <p className="text-sm text-muted-foreground">Individual Rides Revenue</p>
                <p className="text-2xl sm:text-3xl font-display font-medium tabular-nums mt-1 truncate">
                  ₹{(totalIndividualValue / 100000).toFixed(1)}L
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border/50 rounded-[16px] p-4 sm:p-6 ceramic-shadow min-w-0 overflow-hidden"
              >
                <h2 className="font-display text-lg font-medium mb-4">Revenue by Type (₹K)</h2>
                {/* ✅ Scrollable wrapper when there are many months */}
                <div className="overflow-x-auto">
                  <div style={{ minWidth: Math.max(chartData.length * 60, 300) }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 88%)" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11 }}
                          stroke="hsl(30, 10%, 46%)"
                          interval={0}
                          angle={chartData.length > 6 ? -35 : 0}
                          textAnchor={chartData.length > 6 ? "end" : "middle"}
                          height={chartData.length > 6 ? 48 : 30}
                        />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(30, 10%, 46%)" width={40} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(35,15%,88%)", fontSize: 12 }} />
                        <Bar dataKey="Private"    fill="hsl(32, 70%, 50%)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Individual" fill="hsl(42, 50%, 72%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Pie chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border/50 rounded-[16px] p-4 sm:p-6 ceramic-shadow min-w-0 overflow-hidden"
              >
                <h2 className="font-display text-lg font-medium mb-4">Transport Distribution</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={expenses}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(e) => e.name}
                    >
                      {expenses.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v} pax`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* ✅ Legend wraps instead of overflowing */}
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {expenses.map((e, i) => (
                    <div key={e.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="truncate max-w-[120px]">{e.name}: {e.value} pax</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Table — ✅ fully scrollable, never collapses */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border/50 rounded-[16px] p-4 sm:p-6 ceramic-shadow"
            >
              <h2 className="font-display text-lg font-medium mb-4">Monthly Breakdown</h2>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[560px] px-4 sm:px-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left  py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Month</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Pvt Rides</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Pvt Pax</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Pvt Value</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Ind Rides</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Ind Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rideData.map((d) => (
                        <tr key={d.month} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-3 font-medium whitespace-nowrap">{d.month}</td>
                          <td className="py-4 px-3 text-right tabular-nums">{d.privateRides}</td>
                          <td className="py-4 px-3 text-right tabular-nums">{d.privatePax}</td>
                          <td className="py-4 px-3 text-right tabular-nums whitespace-nowrap">₹{(d.privateValue / 1000).toFixed(0)}K</td>
                          <td className="py-4 px-3 text-right tabular-nums">{d.individualRides}</td>
                          <td className="py-4 px-3 text-right tabular-nums whitespace-nowrap">₹{(d.individualValue / 1000).toFixed(0)}K</td>
                        </tr>
                      ))}
                      {rideData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                            No bookings found for the selected date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}