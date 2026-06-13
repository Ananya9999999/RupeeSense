import type { Category, Transaction } from "./demo-data";

export interface Analysis {
  total: number;
  byCategory: { category: Category; amount: number; pct: number }[];
  daily: { date: string; amount: number }[];
  monthly: { month: string; amount: number }[];
  heatmap: { day: string; hour: number; value: number }[];
  shameScore: number;
  shameLevel: string;
  shameRoast: string;
  healthScore: number;
  subscores: { label: string; value: number }[];
  personality: { name: string; icon: string; description: string; risk: string; tip: string };
  suspicious: Transaction[];
  topMerchants: { merchant: string; amount: number; count: number }[];
  opportunityCost: { item: string; price: number; qty: number }[];
  recommendations: {
    topAction: string;
    monthlySavings: number;
    annualSavings: number;
    scoreImprovement: number;
    items: { title: string; detail: string; saves: number }[];
  };
  futureProjection: {
    months: string[];
    current: number[];
    improved: number[];
  };
}

const ROASTS: Array<(n: number) => string> = [
  (food) =>
    `Bro spent ₹${food.toLocaleString("en-IN")} on food delivery. Your bank account has filed for emotional damages.`,
  () => `Your Swiggy driver knows you better than your relatives.`,
  (subs) =>
    `₹${subs.toLocaleString("en-IN")} on subscriptions. You're not a creator — you're a subscriber to your own poverty.`,
  () => `Saving money? Hilarious. Try saving the receipts first.`,
  (shop) =>
    `₹${shop.toLocaleString("en-IN")} on shopping. The cart was full. The fridge isn't.`,
];

export function analyze(txns: Transaction[]): Analysis {
  const total = txns.reduce((s, t) => s + t.amount, 0);

  // by category
  const map = new Map<Category, number>();
  for (const t of txns) map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  const byCategory = [...map.entries()]
    .map(([category, amount]) => ({ category, amount, pct: total ? amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount);

  // daily
  const dailyMap = new Map<string, number>();
  for (const t of txns) {
    const d = t.date.slice(0, 10);
    dailyMap.set(d, (dailyMap.get(d) ?? 0) + t.amount);
  }
  const daily = [...dailyMap.entries()]
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // monthly
  const monthlyMap = new Map<string, number>();
  for (const t of txns) {
    const m = t.date.slice(0, 7);
    monthlyMap.set(m, (monthlyMap.get(m) ?? 0) + t.amount);
  }
  const monthly = [...monthlyMap.entries()]
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // heatmap (day of week x hour bucket)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const heat = new Map<string, number>();
  for (const t of txns) {
    const dt = new Date(t.date);
    const k = `${days[dt.getDay()]}-${dt.getHours()}`;
    heat.set(k, (heat.get(k) ?? 0) + t.amount);
  }
  const heatmap: { day: string; hour: number; value: number }[] = [];
  for (const d of days) for (let h = 0; h < 24; h++) heatmap.push({ day: d, hour: h, value: heat.get(`${d}-${h}`) ?? 0 });

  // Shame & health
  const food = map.get("Food") ?? 0;
  const subs = map.get("Subscriptions") ?? 0;
  const shop = map.get("Shopping") ?? 0;
  const rent = map.get("Rent") ?? 0;
  const discretionary = food + shop + (map.get("Entertainment") ?? 0);
  const baseShame =
    Math.min(35, food / 600) +
    Math.min(25, subs / 200) +
    Math.min(25, shop / 800) +
    Math.min(15, discretionary / (total || 1) * 30);
  const shameScore = Math.min(100, Math.round(baseShame));
  const shameLevel =
    shameScore <= 30 ? "Financial Saint"
    : shameScore <= 60 ? "Needs Improvement"
    : shameScore <= 80 ? "Danger Zone"
    : "Financial Disaster";
  const shameRoast =
    shameScore > 70
      ? ROASTS[0](food)
      : shameScore > 50
      ? ROASTS[2](subs)
      : shameScore > 30
      ? ROASTS[4](shop)
      : ROASTS[3](0);

  const spendingDiscipline = clamp(100 - (discretionary / (total || 1)) * 140);
  const savingsHabit = clamp(100 - (total - rent) / 800);
  const budgetConsistency = clamp(100 - stddev(daily.map((d) => d.amount)) / 200);
  const impulseControl = clamp(100 - (food / (total || 1)) * 180 - (subs / (total || 1)) * 120);
  const healthScore = Math.round((spendingDiscipline + savingsHabit + budgetConsistency + impulseControl) / 4);

  const subscores = [
    { label: "Spending Discipline", value: Math.round(spendingDiscipline) },
    { label: "Savings Habit", value: Math.round(savingsHabit) },
    { label: "Budget Consistency", value: Math.round(budgetConsistency) },
    { label: "Impulse Control", value: Math.round(impulseControl) },
  ];

  // personality
  const personality = pickPersonality({ food, subs, shop, total });

  // top merchants
  const mm = new Map<string, { amount: number; count: number }>();
  for (const t of txns) {
    const cur = mm.get(t.merchant) ?? { amount: 0, count: 0 };
    cur.amount += t.amount;
    cur.count += 1;
    mm.set(t.merchant, cur);
  }
  const topMerchants = [...mm.entries()]
    .map(([merchant, v]) => ({ merchant, ...v }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  // opportunity cost (based on food spend specifically)
  const wasted = Math.max(food, 5000);
  const opportunityCost = [
    { item: "Premium Headphones (Sony WH-CH720N)", price: 8990, qty: Math.floor(wasted / 8990) },
    { item: "Apple Watch SE", price: 29900, qty: +(wasted / 29900).toFixed(2) },
    { item: "Coursera Plus (3 months)", price: 4500, qty: Math.floor(wasted / 4500) },
    { item: "Weekend Trip to Pondicherry", price: 7500, qty: Math.floor(wasted / 7500) },
    { item: "Annual Gym Membership", price: 12000, qty: +(wasted / 12000).toFixed(2) },
  ];

  // recommendations
  const monthlySavings = Math.round((food * 0.35 + subs * 0.4 + shop * 0.2) / 2);
  const recommendations = {
    topAction:
      food > shop && food > subs
        ? "Cut food delivery by 40% — cook 3 dinners a week."
        : subs > shop
        ? "Audit your subscriptions. Cancel 2 you haven't opened in 30 days."
        : "Set a weekly shopping cap and use a 24-hour buy rule.",
    monthlySavings,
    annualSavings: monthlySavings * 12,
    scoreImprovement: Math.min(25, Math.round(monthlySavings / 400)),
    items: [
      { title: "Reduce Swiggy/Zomato orders", detail: "Target ≤ 6 orders/month", saves: Math.round(food * 0.4) },
      { title: "Cancel unused subscriptions", detail: "Netflix + 1 more = ₹797/mo back", saves: Math.round(subs * 0.4) },
      { title: "24-hour rule on shopping", detail: "Add to cart, wait a day, then decide", saves: Math.round(shop * 0.2) },
      { title: "Auto-invest ₹2,000/week", detail: "Index fund SIP via Groww", saves: 8000 },
    ],
  };

  // future projection (12 months)
  const monthlyAvg = total / Math.max(1, monthly.length);
  const months = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
  const current = months.map((_, i) => Math.round(monthlyAvg * (i + 1)));
  const improved = months.map((_, i) => Math.round((monthlyAvg - monthlySavings) * (i + 1)));
  const futureProjection = { months, current, improved };

  const suspicious = txns.filter((t) => t.suspicious);

  return {
    total,
    byCategory,
    daily,
    monthly,
    heatmap,
    shameScore,
    shameLevel,
    shameRoast,
    healthScore,
    subscores,
    personality,
    suspicious,
    topMerchants,
    opportunityCost,
    recommendations,
    futureProjection,
  };
}

function clamp(n: number) { return Math.max(0, Math.min(100, n)); }
function stddev(xs: number[]) {
  if (xs.length === 0) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
}

function pickPersonality({ food, subs, shop, total }: { food: number; subs: number; shop: number; total: number }) {
  const ratios = {
    food: food / (total || 1),
    subs: subs / (total || 1),
    shop: shop / (total || 1),
  };
  if (ratios.food > 0.25) return { name: "Convenience Addict", icon: "🍔", description: "Your kitchen is decorative. Delivery is your love language.", risk: "High", tip: "Meal-prep 3 nights/week to slash 40% of food spend." };
  if (ratios.subs > 0.15) return { name: "Subscription Collector", icon: "📦", description: "You subscribe like it's a hobby. Half of them auto-renew silently.", risk: "Medium", tip: "Run a monthly subscription audit." };
  if (ratios.shop > 0.3) return { name: "Impulse Buyer", icon: "🛒", description: "Sales hypnotise you. Carts fill faster than your wallet empties.", risk: "High", tip: "Use a 24-hour wait rule before checkout." };
  if (total < 25000) return { name: "Smart Saver", icon: "💎", description: "Disciplined. You'd survive a recession with style.", risk: "Low", tip: "Now invest — don't let cash idle in savings." };
  return { name: "Budget Master", icon: "🧠", description: "Balanced across categories. Just a few leaks to plug.", risk: "Low", tip: "Automate a 20% savings transfer on payday." };
}
