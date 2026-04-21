import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { DataEntrySheet } from "../components/DataEntrySheet";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiDetails from "../config/apiDetails";
import {
  format, parse, isWithinInterval,
  startOfDay, endOfDay, subYears,
} from "date-fns";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { Booking, COLORS, ExpenseRow, RideDataRow } from "./types";


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
  if (Array.isArray(raw)) return raw as Booking[];
  if (raw?.data && Array.isArray(raw.data)) return raw.data as Booking[];
  return [];
}

function isPrivateRide(booking: Booking): boolean {
  return booking.transport?.toLowerCase() !== "individual";
}

function getPassengerCount(booking: Booking): number {
  return parseInt(booking.no_people || "0", 10);
}

function toRideDataRows(bookings: Booking[]): RideDataRow[] {
  const map: Record<string, RideDataRow> = {};
  bookings.forEach((b) => {
    const date  = parseBookingDate(b.start_dt);
    const label = date ? format(date, "MMM yyyy") : "Unknown";
    const pax   = getPassengerCount(b);
    if (!map[label]) {
      map[label] = {
        month: label,
        privateRides: 0, privatePax: 0, privateValue: 0,
        individualRides: 0, individualPax: 0, individualValue: 0,
      };
    }
    if (isPrivateRide(b)) {
      map[label].privateRides += 1;
      map[label].privatePax   += pax;
      map[label].privateValue += pax * 3000;
    } else {
      map[label].individualRides += 1;
      map[label].individualPax   += pax;
      map[label].individualValue += pax * 150;
    }
  });
  return Object.values(map).sort((a, b) => {
    const dateA = parse(a.month, "MMM yyyy", new Date());
    const dateB = parse(b.month, "MMM yyyy", new Date());
    return dateA.getTime() - dateB.getTime();
  });
}

function toExpenseRows(bookings: Booking[]): ExpenseRow[] {
  const map: Record<string, number> = {};
  bookings.forEach((b) => {
    const transportType = b.transport || "Other";
    const pax           = getPassengerCount(b);
    map[transportType]  = (map[transportType] || 0) + pax;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}


function useIsDesktop(breakpoint = 640) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= breakpoint
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isDesktop;
}


function TransportDonut({
  data,
  colors,
}: {
  data: ExpenseRow[];
  colors: string[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const isDesktop = useIsDesktop();

  const total = data.reduce((s, d) => s + d.value, 0);

  const cfg = isDesktop
    ? { cx: 90, cy: 90, R: 78, r: 54, size: 180, valSize: 16, lblSize: 10, valDy: -10, lblDy: 13 }
    : { cx: 60, cy: 60, R: 52, r: 36, size: 120, valSize: 13, lblSize:  8, valDy:  -7, lblDy:  9 };

  const arcs: { d: string; color: string; i: number }[] = [];
  let angle = -Math.PI / 2;
  data.forEach((item, i) => {
    const GAP   = 0.035;
    const frac  = total > 0 ? item.value / total : 0;
    const sweep = Math.max(frac * 2 * Math.PI - GAP, 0.01);
    const a1 = angle + GAP / 2;
    const a2 = a1 + sweep;
    const x1 = cfg.cx + cfg.R * Math.cos(a1), y1 = cfg.cy + cfg.R * Math.sin(a1);
    const x2 = cfg.cx + cfg.R * Math.cos(a2), y2 = cfg.cy + cfg.R * Math.sin(a2);
    const x3 = cfg.cx + cfg.r * Math.cos(a2), y3 = cfg.cy + cfg.r * Math.sin(a2);
    const x4 = cfg.cx + cfg.r * Math.cos(a1), y4 = cfg.cy + cfg.r * Math.sin(a1);
    const large = sweep > Math.PI ? 1 : 0;
    arcs.push({
      d: `M${x1.toFixed(2)},${y1.toFixed(2)} A${cfg.R},${cfg.R},0,${large},1,${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${cfg.r},${cfg.r},0,${large},0,${x4.toFixed(2)},${y4.toFixed(2)} Z`,
      color: colors[i % colors.length],
      i,
    });
    angle += frac * 2 * Math.PI;
  });

  const activeItem = hovered !== null ? data[hovered] : null;

  const donut = (
    <svg width={cfg.size} height={cfg.size} viewBox={`0 0 ${cfg.size} ${cfg.size}`}>
      {arcs.map(({ d, color, i }) => (
        <path
          key={i} d={d} fill={color}
          stroke="hsl(var(--card))" strokeWidth={1.5}
          style={{
            opacity: hovered === null || hovered === i ? 1 : 0.25,
            cursor: "pointer", transition: "opacity 0.15s",
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          onTouchStart={() => setHovered(i)}
          onTouchEnd={() => setHovered(null)}
        />
      ))}
      <circle cx={cfg.cx} cy={cfg.cy} r={cfg.r - 1} fill="hsl(var(--card))" />
      <text
        x={cfg.cx} y={cfg.cy + cfg.valDy}
        textAnchor="middle" dominantBaseline="central"
        fontSize={cfg.valSize} fontWeight={600} fill="currentColor"
      >
        {(activeItem ? activeItem.value : total).toLocaleString()}
      </text>
      <text
        x={cfg.cx} y={cfg.cy + cfg.lblDy}
        textAnchor="middle" dominantBaseline="central"
        fontSize={cfg.lblSize} fill="currentColor" opacity={0.45}
      >
        {activeItem
          ? activeItem.name.length > 13 ? activeItem.name.slice(0, 13) + "…" : activeItem.name
          : "total pax"}
      </text>
    </svg>
  );

  const legend = (
    <>
      {data.map((item, i) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <div
            key={item.name}
            className="flex items-center gap-2 min-w-0 cursor-pointer"
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.3, transition: "opacity 0.15s" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(i)}
            onTouchEnd={() => setHovered(null)}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">{item.name}</span>
            <span className="text-xs font-medium tabular-nums shrink-0">{item.value.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-right shrink-0">{pct}%</span>
          </div>
        );
      })}
    </>
  );

  if (isDesktop) {
    return (
      <div className="flex items-center gap-6">
        <div className="shrink-0">{donut}</div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">{legend}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">{donut}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">{legend}</div>
    </div>
  );
}


export default function GangaBoatPage() {
  const today      = new Date();
  const oneYearAgo = subYears(today, 1);

  const [fromDate, setFromDate] = useState(format(oneYearAgo, "yyyy-MM-dd"));
  const [toDate,   setToDate]   = useState(format(today,      "yyyy-MM-dd"));

  const { data: bookings = [], isLoading, isError, error } = useQuery<Booking[], Error>({
    queryKey: ["gangaBoat", fromDate, toDate],
    queryFn:  () => fetchBookings(fromDate, toDate),
    retry: 1,
  });

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const date = parseBookingDate(b.start_dt);
      if (!date) return true;
      const from = fromDate ? startOfDay(new Date(fromDate)) : null;
      const to   = toDate   ? endOfDay(new Date(toDate))     : null;
      if (from && to) return isWithinInterval(date, { start: from, end: to });
      if (from) return date >= from;
      if (to)   return date <= to;
      return true;
    });
  }, [bookings, fromDate, toDate]);

  const rideData = useMemo(() => toRideDataRows(filtered), [filtered]);
  const expenses = useMemo(() => toExpenseRows(filtered),  [filtered]);

  const totalPrivateValue    = rideData.reduce((sum, r) => sum + r.privateValue,    0);
  const totalIndividualValue = rideData.reduce((sum, r) => sum + r.individualValue, 0);

  const chartData = rideData.map((d) => ({
    month:      d.month,
    Private:    d.privateValue    / 1000,
    Individual: d.individualValue / 1000,
  }));

  function resetDates() {
    setFromDate(format(oneYearAgo, "yyyy-MM-dd"));
    setToDate(format(today,        "yyyy-MM-dd"));
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-3 sm:px-4">

       <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-[16px] px-4 py-3 mb-6
                     ceramic-shadow flex flex-wrap items-center gap-x-3 gap-y-2"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="flex-1 sm:flex-none border border-border/60 rounded-lg px-3 py-1.5
                         text-sm bg-transparent focus:outline-none focus:ring-2
                         focus:ring-primary/20 tabular-nums"
            />
          </div>

          {/* To date */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              To
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
              className="flex-1 sm:flex-none border border-border/60 rounded-lg px-3 py-1.5
                         text-sm bg-transparent focus:outline-none focus:ring-2
                         focus:ring-primary/20 tabular-nums"
            />
          </div>

          <button
            onClick={resetDates}
            className="sm:ml-auto text-xs text-primary underline underline-offset-2
                       hover:opacity-75 whitespace-nowrap"
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
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20
                          rounded-[12px] p-3 mb-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load data: {(error as Error)?.message ?? "Unknown error"}</span>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 sm:mb-8">
              <div>
                <h1 className="text-xl sm:text-3xl font-display font-medium">Ganga Boat Ride</h1>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  Private &amp; individual ride tracking
                </p>
              </div>
              <div className="shrink-0">
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
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
              <MetricCard label="Private Revenue"    value={`₹${(totalPrivateValue / 100000).toFixed(1)}L`}    delay={0}   />
              <MetricCard label="Individual Revenue" value={`₹${(totalIndividualValue / 100000).toFixed(1)}L`} delay={0.1} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-5 sm:mb-8">

              {/* Bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border/50 rounded-[16px] p-3 sm:p-6
                           ceramic-shadow min-w-0 overflow-hidden"
              >
                <h2 className="font-display text-sm sm:text-lg font-medium mb-3 sm:mb-4">
                  Revenue by Type (₹K)
                </h2>
                <div className="overflow-x-auto">
                  <div style={{ minWidth: Math.max(chartData.length * 60, 280) }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={chartData} margin={{ left: 0, right: 4, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 88%)" />
                        <XAxis
                          dataKey="month" tick={{ fontSize: 10 }}
                          stroke="hsl(30, 10%, 46%)" interval={0}
                          angle={chartData.length > 6 ? -35 : 0}
                          textAnchor={chartData.length > 6 ? "end" : "middle"}
                          height={chartData.length > 6 ? 48 : 28}
                        />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(30, 10%, 46%)" width={36} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(35,15%,88%)", fontSize: 11 }} />
                        <Bar dataKey="Private"    fill="hsl(32, 70%, 50%)" radius={[5, 5, 0, 0]} />
                        <Bar dataKey="Individual" fill="hsl(42, 50%, 72%)" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Donut */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border/50 rounded-[16px] p-3 sm:p-6
                           ceramic-shadow min-w-0 overflow-hidden"
              >
                <h2 className="font-display text-sm sm:text-lg font-medium mb-0.5">
                  Transport Distribution
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Passenger count by transport type
                </p>
                <TransportDonut data={expenses} colors={COLORS} />
              </motion.div>
            </div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border/50 rounded-[16px] p-3 sm:p-6 ceramic-shadow"
            >
              <h2 className="font-display text-sm sm:text-lg font-medium mb-3 sm:mb-4">
                Monthly Breakdown
              </h2>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="min-w-[520px] px-3 sm:px-0">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left  py-2.5 px-2 sm:px-3 text-muted-foreground font-medium whitespace-nowrap">Month</th>
                        <th className="text-right py-2.5 px-2 sm:px-3 text-muted-foreground font-medium whitespace-nowrap">Pvt Rides</th>
                        <th className="text-right py-2.5 px-2 sm:px-3 text-muted-foreground font-medium whitespace-nowrap">Pvt Pax</th>
                        <th className="text-right py-2.5 px-2 sm:px-3 text-muted-foreground font-medium whitespace-nowrap">Pvt Value</th>
                        <th className="text-right py-2.5 px-2 sm:px-3 text-muted-foreground font-medium whitespace-nowrap">Ind Rides</th>
                        <th className="text-right py-2.5 px-2 sm:px-3 text-muted-foreground font-medium whitespace-nowrap">Ind Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rideData.map((row) => (
                        <RideTableRow key={row.month} row={row} />
                      ))}
                      {rideData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-muted-foreground text-xs sm:text-sm">
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


function MetricCard({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border/50 rounded-[16px] p-3 sm:p-5 ceramic-shadow min-w-0"
    >
      <p className="text-[11px] sm:text-sm text-muted-foreground leading-tight">{label}</p>
      <p className="text-lg sm:text-3xl font-display font-medium tabular-nums mt-1 truncate">{value}</p>
    </motion.div>
  );
}

function RideTableRow({ row }: { row: RideDataRow }) {
  return (
    <tr className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
      <td className="py-3 px-2 sm:px-3 font-medium whitespace-nowrap">{row.month}</td>
      <td className="py-3 px-2 sm:px-3 text-right tabular-nums">{row.privateRides}</td>
      <td className="py-3 px-2 sm:px-3 text-right tabular-nums">{row.privatePax}</td>
      <td className="py-3 px-2 sm:px-3 text-right tabular-nums whitespace-nowrap">₹{(row.privateValue / 1000).toFixed(0)}K</td>
      <td className="py-3 px-2 sm:px-3 text-right tabular-nums">{row.individualRides}</td>
      <td className="py-3 px-2 sm:px-3 text-right tabular-nums whitespace-nowrap">₹{(row.individualValue / 1000).toFixed(0)}K</td>
    </tr>
  );
}