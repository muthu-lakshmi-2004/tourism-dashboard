// ─── Exact original colours ───────────────────────────────────────────────────
export const COLORS = ["hsl(32, 70%, 50%)", "hsl(42, 50%, 72%)", "hsl(35, 15%, 88%)"];

// ─── API booking shape ────────────────────────────────────────────────────────
export interface Booking {
  [x: string]: any;
  id: string;
  start_dt: string;        // "31-Mar-2026 17:00:00"
  tourdescription: string;
  transport: string;
  language: string;
  bookingname: string;
  phone_no: string;
  no_people: string;
  receipt: string | null;
  booker: string;
  payment_status: string;
  tour_id: string;
  guidenames: string;
}

// ─── Shape the original UI expected (from mockData) ───────────────────────────
export interface RideDataRow {
  month: string;
  privateRides: number;
  privatePax: number;
  privateValue: number;
  individualRides: number;
  individualPax: number;
  individualValue: number;
}

export interface ExpenseRow {
  name: string;
  value: number;
}

export interface AccommodationCategory {
  type: string;
  booked: number;
  total: number;
  value: number;
  maintenance: number;
}

export interface MonthRow {
  month: string;
  totalAmount: number;
  count: number;
}

 export interface CategoryRow {
  name: string;
  value: number;   // total ₹
  count: number;
}
export interface Donation {
  id: string;
  puja_date: string;           // "2025-05-11"
  created_at: string;          // "2025-04-08 14:35:33"
  first_name: string;
  last_name: string;
  initiatedname: string | null;
  category: string;
  price: string;
  description: string;
  status: string;
  cost_price: string | null;
}