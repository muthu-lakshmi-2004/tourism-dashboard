import { useMemo } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { MetricCard } from "../components/MetricCard";
import {
  Users,
  IndianRupee,
  Receipt,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { exportDashboardPdf } from "@/lib/exportPdf";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import apiDetails from "../config/apiDetails";
import { format, subYears } from "date-fns";
import { Donation, Booking } from "./types";

const today = new Date();
const fromDate = format(subYears(today, 1), "yyyy-MM-dd");
const toDate = format(today, "yyyy-MM-dd");

async function fetchGangaBookings(): Promise<Booking[]> {
  const res = await axios.post(
    `${apiDetails.baseUrl}${apiDetails.endPoint.gangaBoatRide}`,
    { start_date: fromDate, end_date: toDate },
    {
      params: { token: apiDetails.staticToken },
      headers: { "Content-Type": "application/json" },
    },
  );
  const raw = res.data;
  if (Array.isArray(raw)) return raw as Booking[];
  if (raw?.data && Array.isArray(raw.data)) return raw.data as Booking[];
  return [];
}

async function fetchDonationsData(): Promise<Donation[]> {
  const res = await axios.post(
    `${apiDetails.baseUrl}${apiDetails.endPoint.donations}`,
    { start_date: fromDate, end_date: toDate },
    {
      params: { token: apiDetails.staticToken },
      headers: { "Content-Type": "application/json" },
    },
  );
  const raw = res.data;
  if (Array.isArray(raw)) return raw as Donation[];
  if (raw?.data && Array.isArray(raw.data)) return raw.data as Donation[];
  return [];
}

async function fetchAccommodationData() {
  const res = await axios.post(
    `${apiDetails.baseUrl}${apiDetails.endPoint.accommodation}`,
    { start_date: fromDate, end_date: toDate },
    {
      params: { token: apiDetails.staticToken },
      headers: { "Content-Type": "application/json" },
    },
  );
  const raw = res.data;
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  return [];
}

function gangaStats(bookings: Booking[]) {
  const guests = bookings.reduce(
    (s, b) => s + parseInt(b.no_people || "0", 10),
    0,
  );
  const isPrivate = (b: Booking) => b.transport?.toLowerCase() !== "individual";
  const revenue = bookings.reduce((s, b) => {
    const pax = parseInt(b.no_people || "0", 10);
    return s + (isPrivate(b) ? pax * 3000 : pax * 150);
  }, 0);
  const expenses = bookings.length * 200;
  console.log("GANGA BOOKINGS:", {
    totalBookings: bookings.length,
    totalGuests: guests,
    revenue,
    expenses,
  });
  return { guests, revenue, expenses };
}

function donationStats(donations: Donation[]) {
  const revenue = donations.reduce((s, d) => s + parseFloat(d.price || "0"), 0);
  const guests = donations.length;
  const expenses = donations.reduce(
    (s, d) => s + parseFloat(d.cost_price || "0"),
    0,
  );
  console.log("DONATIONS:", { totalDonations: guests, revenue, expenses });
  return { guests, revenue, expenses };
}

function accommodationStats(bookings: any[]) {
  const getRooms = (b: any) => parseInt(b.rooms || "1", 10);
  const isAc = (b: any) => {
    const desc = (b.description || b.GHD || "").toLowerCase();
    return (
      desc.includes("ac") &&
      !desc.includes("non ac") &&
      !desc.includes("non-ac")
    );
  };
  const acRooms = bookings.filter(isAc).reduce((s, b) => s + getRooms(b), 0);
  const nonAcRooms = bookings
    .filter((b) => !isAc(b))
    .reduce((s, b) => s + getRooms(b), 0);
  const revenue = acRooms * 1500 + nonAcRooms * 750;
  const expenses = acRooms * 120 + nonAcRooms * 60;
  const guests = bookings.length;
  console.log("ACCOMMODATION:", {
    totalBookings: guests,
    acRooms,
    nonAcRooms,
    revenue,
    expenses,
  });
  return { guests, revenue, expenses };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ease: "easeOut" as const, duration: 0.4 },
  },
};

const fmt = (v: number) => `Rs.${(v / 100000).toFixed(1)}L`;
const fmtGuests = (v: number) => v.toLocaleString("en-IN");

const Index = () => {
  const {
    data: gangaRaw = [],
    isLoading: gangaLoading,
    isError: gangaError,
  } = useQuery({ queryKey: ["dashboard-ganga"], queryFn: fetchGangaBookings });

  const {
    data: donationsRaw = [],
    isLoading: donationsLoading,
    isError: donationsError,
  } = useQuery({
    queryKey: ["dashboard-donations"],
    queryFn: fetchDonationsData,
  });

  const {
    data: accomRaw = [],
    isLoading: accomLoading,
    isError: accomError,
  } = useQuery({
    queryKey: ["dashboard-accommodation"],
    queryFn: fetchAccommodationData,
  });

  const isLoading = gangaLoading || donationsLoading || accomLoading;
  const isError = gangaError || donationsError || accomError;

  const ganga = useMemo(() => gangaStats(gangaRaw), [gangaRaw]);
  const donations = useMemo(() => donationStats(donationsRaw), [donationsRaw]);
  const accom = useMemo(() => accommodationStats(accomRaw), [accomRaw]);

  const totalGuests = ganga.guests + donations.guests + accom.guests;
  const totalRevenue = ganga.revenue + donations.revenue + accom.revenue;
  const totalExpenses = ganga.expenses + donations.expenses + accom.expenses;

  // Separate trend variables — update with real API data when available
  const guestsTrend = 0;
  const revenueTrend = 0;
  const expensesTrend = 0;

  const overviewDepts = [
    { name: "Ganga Boat Ride", ...ganga },
    { name: "Donations", ...donations },
    { name: "Accommodation", ...accom },
  ];

  console.log("DASHBOARD TOTALS:", {
    totalGuests,
    totalRevenue,
    totalExpenses,
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-medium">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Tracking Ganga Boat Ride, Donations &amp; Accommodation.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportDashboardPdf({
                totalGuests,
                totalRevenue,
                totalExpenses,
                guestsTrend: 0,
                revenueTrend: 0,
                expensesTrend: 0,
                depts: overviewDepts,
              })
            }
            className="saffron-pulse gap-2"
          >
            <Download className="h-4 w-4" strokeWidth={1.5} />
            Export PDF
          </Button>
        </div>

        {isError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            One or more data sources failed to load. Showing partial data.
          </div>
        )}

        {/* Metric Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          <motion.div variants={item}>
            <MetricCard
              title="Total Guests"
              value={isLoading ? "—" : fmtGuests(totalGuests)}
              trend={guestsTrend}
              icon={
                isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Users className="h-5 w-5" strokeWidth={1.5} />
                )
              }
            />
          </motion.div>
          <motion.div variants={item}>
            <MetricCard
              title="Total Revenue"
              value={isLoading ? "—" : fmt(totalRevenue)}
              trend={revenueTrend}
              icon={
                isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <IndianRupee className="h-5 w-5" strokeWidth={1.5} />
                )
              }
            />
          </motion.div>
          <motion.div variants={item}>
            <MetricCard
              title="Total Expenses"
              value={isLoading ? "—" : fmt(totalExpenses)}
              trend={expensesTrend}
              icon={
                isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Receipt className="h-5 w-5" strokeWidth={1.5} />
                )
              }
            />
          </motion.div>
        </motion.div>

        {/* Quick Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow"
        >
          <h2 className="font-display text-xl font-medium mb-4">
            Quick Overview
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading department data…
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overviewDepts.map((dept) => (
                <div
                  key={dept.name}
                  className="bg-secondary/50 rounded-md p-4 text-center"
                >
                  <p className="text-sm text-muted-foreground mb-1">
                    {dept.name}
                  </p>
                  <p className="font-display text-lg font-medium tabular-nums">
                    {fmt(dept.revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fmtGuests(dept.guests)} guests
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Exp: {fmt(dept.expenses)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
