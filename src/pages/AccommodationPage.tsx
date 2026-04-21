import { useState, useMemo } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { DataEntrySheet } from "../components/DataEntrySheet";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiDetails from "../config/apiDetails";
import { format, subYears } from "date-fns";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";

async function fetchAccommodationBookings(fromDate, toDate) {
  const response = await axios.post(
    `${apiDetails.baseUrl}${apiDetails.endPoint.accommodation}`,
    { start_date: fromDate, end_date: toDate },
    {
      params: { token: apiDetails.staticToken },
      headers: { "Content-Type": "application/json" },
    },
  );
  const raw = response.data;
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  return [];
}

function isAcRoom(booking) {
  const desc = (booking.description || booking.GHD || "").toLowerCase();
  return (
    desc.includes("ac") && !desc.includes("non ac") && !desc.includes("non-ac")
  );
}

function isNonAcRoom(booking) {
  const desc = (booking.description || booking.GHD || "").toLowerCase();
  return desc.includes("non ac") || desc.includes("non-ac");
}

function getRoomCount(booking) {
  return parseInt(booking.rooms || "1", 10);
}

function buildCategories(bookings) {
  const acBookings = bookings.filter(isAcRoom);
  const nonAcBookings = bookings.filter(isNonAcRoom);

  const totalAcRooms = acBookings.reduce((sum, b) => sum + getRoomCount(b), 0);
  const totalNonAcRooms = nonAcBookings.reduce(
    (sum, b) => sum + getRoomCount(b),
    0,
  );

  return [
    {
      type: "A/C Rooms",
      booked: totalAcRooms,
      total: Math.max(totalAcRooms, 1800),
      value: totalAcRooms * 1500,
      maintenance: totalAcRooms * 120,
    },
    {
      type: "Non-A/C Rooms",
      booked: totalNonAcRooms,
      total: Math.max(totalNonAcRooms, 1200),
      value: totalNonAcRooms * 750,
      maintenance: totalNonAcRooms * 60,
    },
  ];
}

export default function AccommodationPage() {
  const today = new Date();
  const oneYearAgo = subYears(today, 1);

  const [fromDate, setFromDate] = useState(format(oneYearAgo, "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(today, "yyyy-MM-dd"));

  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["accommodation", fromDate, toDate],
    queryFn: () => fetchAccommodationBookings(fromDate, toDate),
    retry: 1,
  });

  const categories = useMemo(() => buildCategories(bookings), [bookings]);

  const totalValue = categories.reduce((sum, c) => sum + c.value, 0);
  const totalMaintenance = categories.reduce(
    (sum, c) => sum + c.maintenance,
    0,
  );

  const chartData = categories.map((c) => ({
    type: c.type,
    Revenue: Math.round(c.value / 1000),
    Maintenance: Math.round(c.maintenance / 1000),
  }));

  function resetDates() {
    setFromDate(format(oneYearAgo, "yyyy-MM-dd"));
    setToDate(format(today, "yyyy-MM-dd"));
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
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

        {isLoading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading bookings…</span>
          </div>
        )}

        {isError && (
          <div
            className="flex items-center gap-3 bg-destructive/10 border border-destructive/20
                          rounded-[12px] p-4 mb-6 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Failed to load data: {error?.message ?? "Unknown error"}
            </span>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-medium">
                  Accommodation
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  A/C &amp; Non-A/C room booking reports
                </p>
              </div>
              <div className="shrink-0">
                <DataEntrySheet
                  title="Add Booking Entry"
                  fields={[
                    { name: "type", label: "Room Type (A/C or Non-A/C)" },
                    { name: "booked", label: "Rooms Booked", type: "number" },
                    { name: "value", label: "Total Value (₹)", type: "number" },
                    {
                      name: "maintenance",
                      label: "Maintenance Cost (₹)",
                      type: "number",
                    },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
              <SummaryCard
                label="Total Booking Revenue"
                value={`₹${(totalValue / 100000).toFixed(1)}L`}
                delay={0}
              />
              <SummaryCard
                label="Total Maintenance"
                value={`₹${(totalMaintenance / 100000).toFixed(1)}L`}
                delay={0.1}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border/50 rounded-[16px] p-4 sm:p-6
                           ceramic-shadow min-w-0 overflow-hidden"
              >
                <h2 className="font-display text-base sm:text-lg font-medium mb-4">
                  Revenue vs Maintenance (₹K)
                </h2>

                {categories.length === 0 ? (
                  <EmptyState height={240} />
                ) : (
                  <div className="overflow-x-auto -mx-1">
                    <div style={{ minWidth: 260 }}>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart
                          data={chartData}
                          margin={{ left: 0, right: 4, top: 4, bottom: 4 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(35, 15%, 88%)"
                          />
                          <XAxis
                            dataKey="type"
                            tick={{ fontSize: 11 }}
                            stroke="hsl(30, 10%, 46%)"
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="hsl(30, 10%, 46%)"
                            width={34}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: "1px solid hsl(35,15%,88%)",
                              fontSize: 12,
                            }}
                          />
                          <Bar
                            dataKey="Revenue"
                            fill="hsl(32, 70%, 50%)"
                            radius={[6, 6, 0, 0]}
                          />
                          <Bar
                            dataKey="Maintenance"
                            fill="hsl(42, 50%, 72%)"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Room Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border/50 rounded-[16px] p-4 sm:p-6
                           ceramic-shadow min-w-0"
              >
                <h2 className="font-display text-base sm:text-lg font-medium mb-4">
                  Room Details
                </h2>

                {categories.length === 0 ? (
                  <EmptyState height={200} message="No room data available" />
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {categories.map((cat) => (
                      <RoomCategoryCard key={cat.type} category={cat} />
                    ))}
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

function SummaryCard({ label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border/50 rounded-[16px] p-4 sm:p-5 ceramic-shadow min-w-0"
    >
      <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
        {label}
      </p>
      <p className="text-xl sm:text-3xl font-display font-medium tabular-nums mt-1 truncate">
        {value}
      </p>
    </motion.div>
  );
}

function RoomCategoryCard({ category }) {
  const occupancyPercent = Math.min(
    100,
    Math.round((category.booked / category.total) * 100),
  );

  return (
    <div className="bg-secondary/30 rounded-md p-3 sm:p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-sm sm:text-base">
          {category.type}
        </span>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {occupancyPercent}% booked
        </span>
      </div>

      <div className="w-full bg-border/50 rounded-full h-2 mb-3">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-700"
          style={{ width: `${occupancyPercent}%` }}
        />
      </div>

      <div
        className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-0
                      text-xs sm:text-sm text-muted-foreground"
      >
        <span>
          {category.booked} / {category.total} rooms
        </span>
        <span>₹{(category.value / 100000).toFixed(1)}L revenue</span>
      </div>
    </div>
  );
}

function EmptyState({ height, message = "No data for selected period" }) {
  return (
    <div
      className="flex items-center justify-center text-muted-foreground text-sm"
      style={{ height }}
    >
      {message}
    </div>
  );
}
