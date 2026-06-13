export function formatINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
