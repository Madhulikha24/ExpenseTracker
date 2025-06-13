// helpers.js

// Converts a timestamp to MM/DD/YYYY format
// IMPORTANT: This expects a Unix timestamp (milliseconds) as input
export function formatDate(timestamp) {
  const date = new Date(parseInt(timestamp)); // Correct if timestamp is string like "1705359000000"

  if (isNaN(date.getTime())) return "Invalid Date";

  const month = date.getMonth() + 1; // getMonth() is 0-indexed
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;

  return `${formattedMonth}/${formattedDay}/${year}`;
}

// ... (rest of your helpers.js remains unchanged)
export function formatAmount(x) {
    if (typeof x === "undefined" || x === null || isNaN(x)) {
      return "";
    }
    const num = typeof x === "string" ? parseFloat(x) : x;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  export function formatAmountDecimal(x) {
    if (typeof x === "undefined" || x === null || isNaN(x)) {
      return "";
    }
    const num = typeof x === "string" ? parseFloat(x) : x;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  export function calculateFutureValue(P, PMT, r, n, t) {
    if (r === 0 || n === 0) {
      return P + PMT * n * t;
    }

    const ratePerPeriod = r / 100 / n;
    const totalPeriods = n * t;

    const futureValue =
      P * Math.pow(1 + ratePerPeriod, totalPeriods) +
      (PMT * (Math.pow(1 + ratePerPeriod, totalPeriods) - 1)) / ratePerPeriod;

    return futureValue;
  }