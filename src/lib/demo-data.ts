export type Category =
  | "Food"
  | "Shopping"
  | "Bills"
  | "Transport"
  | "Entertainment"
  | "Subscriptions"
  | "Rent"
  | "Other";

export interface Transaction {
  id: string;
  date: string; // ISO
  merchant: string;
  amount: number; // INR, positive = spend
  category: Category;
  note?: string;
  suspicious?: boolean;
  suspiciousReason?: string;
}

const merchants: Record<Category, string[]> = {
  Food: ["Swiggy", "Zomato", "Blinkit", "Starbucks", "Dominos", "KFC", "EatFit"],
  Shopping: ["Flipkart", "Amazon", "Myntra", "Ajio", "Nykaa", "Croma"],
  Bills: ["Airtel", "Jio", "Tata Power", "BESCOM", "Water Board"],
  Transport: ["Uber", "Ola", "Rapido", "IRCTC", "Indigo"],
  Entertainment: ["BookMyShow", "PVR", "Steam", "PlayStation"],
  Subscriptions: ["Netflix", "Spotify", "Hotstar", "YouTube Premium", "ChatGPT Plus", "Notion", "iCloud"],
  Rent: ["Landlord — Rent"],
  Other: ["ATM Withdrawal", "Cash Transfer", "PhonePe to Friend"],
};

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(c: Category): number {
  const ranges: Record<Category, [number, number]> = {
    Food: [120, 850],
    Shopping: [499, 6500],
    Bills: [299, 2400],
    Transport: [80, 650],
    Entertainment: [199, 1500],
    Subscriptions: [149, 999],
    Rent: [18000, 22000],
    Other: [200, 3000],
  };
  const [a, b] = ranges[c];
  return Math.round(a + Math.random() * (b - a));
}

export function generateDemoTransactions(days = 60): Transaction[] {
  const out: Transaction[] = [];
  const now = Date.now();
  const cats: Category[] = ["Food", "Shopping", "Bills", "Transport", "Entertainment", "Subscriptions", "Other"];

  for (let d = 0; d < days; d++) {
    const dayDate = new Date(now - d * 86400000);
    // Food orders skew heavy
    const foodCount = Math.random() < 0.7 ? 1 + Math.floor(Math.random() * 3) : 0;
    for (let i = 0; i < foodCount; i++) {
      out.push({
        id: crypto.randomUUID(),
        date: dayDate.toISOString(),
        merchant: rand(merchants.Food),
        amount: randomAmount("Food"),
        category: "Food",
      });
    }
    // Other categories
    const extra = Math.floor(Math.random() * 3);
    for (let i = 0; i < extra; i++) {
      const c = rand(cats.filter((x) => x !== "Food"));
      out.push({
        id: crypto.randomUUID(),
        date: dayDate.toISOString(),
        merchant: rand(merchants[c]),
        amount: randomAmount(c),
        category: c,
      });
    }
  }
  // Monthly rent
  const rentDate = new Date(now - 5 * 86400000);
  out.push({
    id: crypto.randomUUID(),
    date: rentDate.toISOString(),
    merchant: merchants.Rent[0],
    amount: randomAmount("Rent"),
    category: "Rent",
  });
  // Subscriptions x6
  for (const m of ["Netflix", "Spotify", "Hotstar", "YouTube Premium", "ChatGPT Plus", "Notion"]) {
    out.push({
      id: crypto.randomUUID(),
      date: new Date(now - Math.floor(Math.random() * 28) * 86400000).toISOString(),
      merchant: m,
      amount: randomAmount("Subscriptions"),
      category: "Subscriptions",
    });
  }
  // A couple of suspicious ones
  out.push({
    id: crypto.randomUUID(),
    date: new Date(now - 2 * 86400000).toISOString(),
    merchant: "UNKNOWN*INTL*MERCHANT",
    amount: 14999,
    category: "Other",
    suspicious: true,
    suspiciousReason: "Unusual foreign merchant, amount 8x your daily average",
  });
  out.push({
    id: crypto.randomUUID(),
    date: new Date(now - 11 * 86400000).toISOString(),
    merchant: "QUICKPAY*REFUND",
    amount: 4999,
    category: "Other",
    suspicious: true,
    suspiciousReason: "Duplicate charge within 3 minutes",
  });
  return out.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
