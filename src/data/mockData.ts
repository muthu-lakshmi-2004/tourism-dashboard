export interface DepartmentSummary {
  totalGuests: number;
  totalRevenue: number;
  totalExpenses: number;
  guestsTrend: number;
  revenueTrend: number;
  expensesTrend: number;
}

export const dashboardSummary: DepartmentSummary = {
  totalGuests: 12847,
  totalRevenue: 4825000,
  totalExpenses: 1890000,
  guestsTrend: 12.5,
  revenueTrend: 8.3,
  expensesTrend: -3.2,
};

export const nineIslandYoY = {
  current: [
    { month: "Jan", tours: 120, guests: 480, value: 360000 },
    { month: "Feb", tours: 95, guests: 380, value: 285000 },
    { month: "Mar", tours: 140, guests: 560, value: 420000 },
    { month: "Apr", tours: 110, guests: 440, value: 330000 },
    { month: "May", tours: 85, guests: 340, value: 255000 },
    { month: "Jun", tours: 70, guests: 280, value: 210000 },
    { month: "Jul", tours: 60, guests: 240, value: 180000 },
    { month: "Aug", tours: 75, guests: 300, value: 225000 },
    { month: "Sep", tours: 100, guests: 400, value: 300000 },
    { month: "Oct", tours: 130, guests: 520, value: 390000 },
    { month: "Nov", tours: 150, guests: 600, value: 450000 },
    { month: "Dec", tours: 160, guests: 640, value: 480000 },
  ],
  previous: [
    { month: "Jan", tours: 100, guests: 400, value: 300000 },
    { month: "Feb", tours: 80, guests: 320, value: 240000 },
    { month: "Mar", tours: 120, guests: 480, value: 360000 },
    { month: "Apr", tours: 90, guests: 360, value: 270000 },
    { month: "May", tours: 70, guests: 280, value: 210000 },
    { month: "Jun", tours: 55, guests: 220, value: 165000 },
    { month: "Jul", tours: 50, guests: 200, value: 150000 },
    { month: "Aug", tours: 65, guests: 260, value: 195000 },
    { month: "Sep", tours: 85, guests: 340, value: 255000 },
    { month: "Oct", tours: 110, guests: 440, value: 330000 },
    { month: "Nov", tours: 125, guests: 500, value: 375000 },
    { month: "Dec", tours: 140, guests: 560, value: 420000 },
  ],
  expenses: [
    { name: "Traveling", value: 280000 },
    { name: "Salary", value: 450000 },
    { name: "Overheads", value: 120000 },
  ],
  significantPoints: "Peak season (Oct-Dec) showed a 15% improvement over the previous year. Monsoon months (Jun-Aug) remain the lowest performing period. Tour guide training program launched in Q2 contributed to higher guest satisfaction scores.",
};

export const gangaBoatRide = {
  data: [
    { month: "Jan", privateRides: 45, privatePax: 270, privateValue: 135000, individualRides: 320, individualPax: 320, individualValue: 48000 },
    { month: "Feb", privateRides: 38, privatePax: 228, privateValue: 114000, individualRides: 280, individualPax: 280, individualValue: 42000 },
    { month: "Mar", privateRides: 52, privatePax: 312, privateValue: 156000, individualRides: 350, individualPax: 350, individualValue: 52500 },
    { month: "Apr", privateRides: 40, privatePax: 240, privateValue: 120000, individualRides: 300, individualPax: 300, individualValue: 45000 },
    { month: "May", privateRides: 30, privatePax: 180, privateValue: 90000, individualRides: 250, individualPax: 250, individualValue: 37500 },
    { month: "Jun", privateRides: 22, privatePax: 132, privateValue: 66000, individualRides: 180, individualPax: 180, individualValue: 27000 },
  ],
  expenses: [
    { name: "Fuel", value: 180000 },
    { name: "Salary", value: 320000 },
    { name: "Repair & Maintenance", value: 95000 },
  ],
};

export const accommodation = {
  categories: [
    { type: "A/C Rooms", booked: 1240, total: 1800, value: 1860000, maintenance: 220000 },
    { type: "Non-A/C Rooms", booked: 890, total: 1200, value: 667500, maintenance: 145000 },
  ],
};

export const transport = {
  vehicles: [
    { type: "Cars", booked: 680, income: 510000, expense: 195000 },
    { type: "Buses", booked: 120, income: 360000, expense: 280000 },
  ],
};

export const roomOccupancy = {
  blocks: [
    { name: "Isodyan", totalRooms: 50, occupied: 42, revenue: 630000 },
    { name: "MTC 1", totalRooms: 40, occupied: 35, revenue: 525000 },
    { name: "MTC 2", totalRooms: 40, occupied: 30, revenue: 450000 },
    { name: "MTC 3", totalRooms: 35, occupied: 28, revenue: 420000 },
  ],
};
