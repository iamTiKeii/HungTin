/**
 * Standard utility for converting contract loan durations and interest periods
 * between display units (days / weeks / months) and pure day values.
 */

export function getUnitMultiplier(interestTypeCodeOrUnit?: string): number {
  if (!interestTypeCodeOrUnit) return 1;
  const lower = String(interestTypeCodeOrUnit).toLowerCase();

  // Explicit unit strings
  if (lower === "thang" || lower === "month" || lower === "monthly") return 30;
  if (lower === "tuan" || lower === "week" || lower === "weekly") return 7;
  if (lower === "ngay" || lower === "day" || lower === "daily") return 1;

  // Interest type code patterns
  if (
    lower.includes("monthly") ||
    lower.includes("month") ||
    lower === "flat_rate_monthly" ||
    (lower.includes("flat_rate") && !lower.includes("daily")) ||
    lower.includes("reducing_balance")
  ) {
    return 30;
  }

  if (lower.includes("weekly") || lower.includes("week")) {
    return 7;
  }

  return 1;
}

export function convertDurationToDays(
  value: number | string,
  interestTypeCodeOrUnit?: string
): number {
  const num = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  if (num <= 0 || isNaN(num)) return 0;

  const mult = getUnitMultiplier(interestTypeCodeOrUnit);
  if (mult === 1) return Math.round(num);

  // If already converted to days (e.g. 30, 60, 90 for monthly or 7, 14, 21 for weekly)
  if (num >= mult && Math.round(num) % mult === 0) {
    return Math.round(num);
  }

  // Raw display units (e.g. 3 months -> 90 days, 1 month -> 30 days, 2 weeks -> 14 days)
  return Math.round(num * mult);
}

export function convertDaysToDisplayUnit(
  days: number | string,
  interestTypeCodeOrUnit?: string
): number {
  const num = typeof days === "number" ? days : parseFloat(String(days)) || 0;
  if (num <= 0 || isNaN(num)) return 0;
  const mult = getUnitMultiplier(interestTypeCodeOrUnit);
  return mult > 1 ? Math.round((num / mult) * 100) / 100 : num;
}

export function formatLoanDurationText(
  days: number | string,
  interestTypeCodeOrUnit?: string
): string {
  const numDays = typeof days === "number" ? days : parseFloat(String(days)) || 0;
  if (!numDays) return "0 ngày";

  const mult = getUnitMultiplier(interestTypeCodeOrUnit);
  const displayVal = convertDaysToDisplayUnit(numDays, interestTypeCodeOrUnit);

  if (mult === 30) {
    return `${displayVal} tháng`;
  }
  if (mult === 7) {
    return `${displayVal} tuần`;
  }
  return `${displayVal} ngày`;
}

export function formatPeriodValueText(
  periodDays: number | string,
  interestTypeCodeOrUnit?: string
): string {
  const numDays = typeof periodDays === "number" ? periodDays : parseFloat(String(periodDays)) || 0;
  if (!numDays) return "0 ngày";

  const mult = getUnitMultiplier(interestTypeCodeOrUnit);
  const displayVal = convertDaysToDisplayUnit(numDays, interestTypeCodeOrUnit);

  if (mult === 30) {
    return `${displayVal} tháng`;
  }
  if (mult === 7) {
    return `${displayVal} tuần`;
  }
  return `${displayVal} ngày`;
}
