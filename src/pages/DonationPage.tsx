
import { useState, useMemo } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { DataEntrySheet } from "../components/DataEntrySheet";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
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
import { COLORS, CategoryRow, MonthRow, Donation } from "./types";



function parsePujaDate(dateStr: string): Date | null {
  try {
    return parse(dateStr, "yyyy-MM-dd", new Date());
  } catch {
    return null;
  }
}

async function fetchDonations(fromDate: string, toDate: string): Promise<Donation[]> {
  const response = await axios.post(
    `${apiDetails.baseUrl}${apiDetails.endPoint.donations}`,
    { start_date: fromDate, end_date: toDate },
    {
      params: { token: apiDetails.staticToken },
      headers: { "Content-Type": "application/json" },
    },
  );

  const raw = response.data;
  if (Array.isArray(raw)) return raw as Donation[];
  if (raw?.data && Array.isArray(raw.data)) return raw.data as Donation[];
  return [];
}

function toMonthRows(donations: Donation[]): MonthRow[] {
  const map: Record<string, MonthRow> = {};

  donations.forEach((d) => {
    const date  = parsePujaDate(d.puja_date);
    const label = date ? format(date, "MMM yyyy") : "Unknown";
    const amt   = parseFloat(d.price || "0");

    if (!map[label]) map[label] = { month: label, totalAmount: 0, count: 0 };
    map[label].totalAmount += amt;
    map[label].count       += 1;
  });

  return Object.values(map).sort((a, b) => {
    const dateA = parse(a.month, "MMM yyyy", new Date());
    const dateB = parse(b.month, "MMM yyyy", new Date());
    return dateA.getTime() - dateB.getTime();
  });
}

function toCategoryRows(donations: Donation[]): CategoryRow[] {
  const map: Record<string, CategoryRow> = {};

  donations.forEach((d) => {
    const cat = d.category || "Other";
    const amt = parseFloat(d.price || "0");

    if (!map[cat]) map[cat] = { name: cat, value: 0, count: 0 };
    map[cat].value += amt;
    map[cat].count += 1;
  });

  return Object.values(map).sort((a, b) => b.value - a.value);
}

const STATUS_CLASS: Record<string, string> = {
  "Prasadam Sent": "bg-green-100 text-green-800",
  "Confirmed":     "bg-teal-100  text-teal-800",
  "Pending":       "bg-amber-100 text-amber-800",
};



interface ExpenseRow {
  name: string;
  value: number;
  count?: number;
}

function TransportDonut({
  data,
  colors,
}: {
  data: ExpenseRow[];
  colors: string[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 80, cy = 80, R = 62, r = 44, GAP = 0.04;

  const arcs: { d: string; color: string; item: ExpenseRow; i: number }[] = [];
  let angle = -Math.PI / 2;

  data.forEach((item, i) => {
    const frac  = total > 0 ? item.value / total : 0;
    const sweep = frac * 2 * Math.PI - GAP;
    const a1 = angle + GAP / 2;
    const a2 = a1 + sweep;
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    const x3 = cx + r * Math.cos(a2), y3 = cy + r * Math.sin(a2);
    const x4 = cx + r * Math.cos(a1), y4 = cy + r * Math.sin(a1);
    const large = sweep > Math.PI ? 1 : 0;
    arcs.push({
      d: `M${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} L${x3},${y3} A${r},${r},0,${large},0,${x4},${y4} Z`,
      color: colors[i % colors.length],
      item,
      i,
    });
    angle += frac * 2 * Math.PI;
  });

  const activeItem = hovered !== null ? data[hovered] : null;

  // Format center value as ₹K
  const centerValue = activeItem
    ? `₹${(activeItem.value / 1000).toFixed(1)}K`
    : `₹${(total / 1000).toFixed(1)}K`;

  const centerLabel = activeItem
    ? activeItem.name.length > 10
      ? activeItem.name.slice(0, 10) + "…"
      : activeItem.name
    : "total";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 min-w-0">
      {/* Donut SVG */}
      <svg
        width={160}
        height={160}
        viewBox="0 0 160 160"
        className="shrink-0 mx-auto sm:mx-0"
      >
        {arcs.map(({ d, color, i }) => (
          <path
            key={i}
            d={d}
            fill={color}
            stroke="hsl(var(--card))"
            strokeWidth={2}
            opacity={hovered === null || hovered === i ? 1 : 0.3}
            className="cursor-pointer transition-opacity duration-150"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={r - 2} fill="hsl(var(--card))" />
        {/* Center value */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground"
          fontSize={activeItem ? 13 : 15}
          fontWeight={500}
        >
          {centerValue}
        </text>
        {/* Center label */}
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          className="fill-muted-foreground"
        >
          {centerLabel}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 flex-1 min-w-0 w-full">
        {data.map((item, i) => (
          <div
            key={item.name}
            className="flex items-center gap-2 cursor-pointer transition-opacity duration-150"
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.35 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="text-sm text-muted-foreground truncate flex-1">
              {item.name}
            </span>
            <span className="text-sm font-medium tabular-nums">
              ₹{(item.value / 1000).toFixed(1)}K
            </span>
            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}



export default function DonationPage() {
  const today      = new Date();
  const oneYearAgo = subYears(today, 1);

  const [fromDate, setFromDate] = useState(format(oneYearAgo, "yyyy-MM-dd"));
  const [toDate,   setToDate]   = useState(format(today,      "yyyy-MM-dd"));

  const { data: donations = [], isLoading, isError, error } =
    useQuery<Donation[], Error>({
      queryKey: ["donations", fromDate, toDate],
      queryFn:  () => fetchDonations(fromDate, toDate),
      retry: 1,
    });

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      const date = parsePujaDate(d.puja_date);
      if (!date) return true;

      const from = fromDate ? startOfDay(new Date(fromDate)) : null;
      const to   = toDate   ? endOfDay(new Date(toDate))     : null;

      if (from && to) return isWithinInterval(date, { start: from, end: to });
      if (from) return date >= from;
      if (to)   return date <= to;
      return true;
    });
  }, [donations, fromDate, toDate]);

  const monthRows    = useMemo(() => toMonthRows(filtered),    [filtered]);
  const categoryRows = useMemo(() => toCategoryRows(filtered), [filtered]);

  const totalRevenue = filtered.reduce((sum, d) => sum + parseFloat(d.price || "0"), 0);
  const totalCount   = filtered.length;
  const prasadamSent = filtered.filter((d) => d.status === "Prasadam Sent").length;

  const chartData = monthRows.map((r) => ({
    month:  r.month,
    Amount: +(r.totalAmount / 1000).toFixed(1),
  }));

  function resetDates() {
    setFromDate(format(oneYearAgo, "yyyy-MM-dd"));
    setToDate(format(today, "yyyy-MM-dd"));
  }

  const metricCards = [
    { label: "Total Revenue",  value: `₹${(totalRevenue / 100000).toFixed(1)}L` },
    { label: "Total Bookings", value: totalCount.toLocaleString() },
    { label: "Prasadam Sent",  value: prasadamSent.toLocaleString() },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4">

        {/* ── Date Filter Bar ── */}
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

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading donations…</span>
          </div>
        )}

        {/* ── Error ── */}
        {isError && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20
                          rounded-[12px] p-4 mb-6 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load data: {(error as Error)?.message ?? "Unknown error"}</span>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* ── Page Header ── */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-medium">
                  Festival Donations
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Puja bookings &amp; category tracking
                </p>
              </div>
              <DataEntrySheet
                title="Add Donation Entry"
                fields={[
                  { name: "first_name",  label: "First Name" },
                  { name: "last_name",   label: "Last Name" },
                  { name: "category",    label: "Festival Category" },
                  { name: "description", label: "Puja Type" },
                  { name: "price",       label: "Amount (₹)", type: "number" },
                  { name: "puja_date",   label: "Puja Date",  type: "date" },
                  { name: "status",      label: "Status" },
                ]}
              />
            </div>

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {metricCards.map((card, i) => (
                <MetricCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  delay={i * 0.1}
                />
              ))}
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {/* Bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border/50 rounded-[16px] p-4 sm:p-6
                           ceramic-shadow min-w-0 overflow-hidden"
              >
                <h2 className="font-display text-lg font-medium mb-4">
                  Monthly Revenue (₹K)
                </h2>
                <div className="overflow-x-auto">
                  <div style={{ minWidth: Math.max(chartData.length * 60, 300) }}>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={chartData}
                        margin={{ left: 0, right: 8, top: 4, bottom: 4 }}
                      >
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
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid hsl(35,15%,88%)", fontSize: 12 }}
                          formatter={(v: number) => [`₹${v}K`, "Revenue"]}
                        />
                        <Bar dataKey="Amount" fill="hsl(32, 70%, 50%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Donut chart — TransportDonut replaces Recharts PieChart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border/50 rounded-[16px] p-4 sm:p-6
                           ceramic-shadow min-w-0 overflow-hidden"
              >
                <h2 className="font-display text-lg font-medium mb-4">
                  Festival Category Distribution
                </h2>

                <TransportDonut
                  data={categoryRows}
                  colors={COLORS}
                />
              </motion.div>
            </div>

            {/* ── Bookings Table ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border/50 rounded-[16px] p-4 sm:p-6 ceramic-shadow"
            >
              <h2 className="font-display text-lg font-medium mb-4">Booking Details</h2>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[640px] px-4 sm:px-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left  py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Devotee</th>
                        <th className="text-left  py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Category</th>
                        <th className="text-left  py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Puja</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Puja Date</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Amount</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, 50).map((d) => (
                        <DonationTableRow key={d.id} donation={d} />
                      ))}

                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                            No donations found for the selected date range.
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
      className="bg-card border border-border/50 rounded-[16px] p-5 ceramic-shadow min-w-0"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl sm:text-3xl font-display font-medium tabular-nums mt-1 truncate">
        {value}
      </p>
    </motion.div>
  );
}

function DonationTableRow({ donation: d }: { donation: Donation }) {
  const name = [d.initiatedname, d.first_name, d.last_name]
    .filter(Boolean)
    .join(" ");

  const statusCls = STATUS_CLASS[d.status] ?? "bg-secondary text-muted-foreground";

  const formattedDate = d.puja_date
    ? format(parse(d.puja_date, "yyyy-MM-dd", new Date()), "dd MMM yyyy")
    : "—";

  return (
    <tr className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
      <td className="py-4 px-3 font-medium whitespace-nowrap">{name}</td>
      <td className="py-4 px-3 whitespace-nowrap">{d.category}</td>
      <td className="py-4 px-3 whitespace-nowrap">{d.description}</td>
      <td className="py-4 px-3 text-right tabular-nums whitespace-nowrap">{formattedDate}</td>
      <td className="py-4 px-3 text-right tabular-nums whitespace-nowrap">
        ₹{parseFloat(d.price).toLocaleString("en-IN")}
      </td>
      <td className="py-4 px-3 text-right whitespace-nowrap">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>
          {d.status}
        </span>
      </td>
    </tr>
  );
}