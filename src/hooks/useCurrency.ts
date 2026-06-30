import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£"
};

// Rates relative to INR (e.g. 1 USD = 83 INR, so to convert INR to USD we divide by 83)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105
};

export function useCurrency() {
  const { data: tenantSummary } = useQuery({
    queryKey: ["tenant-summary"],
    queryFn: () => api.getTenantSummary(),
    staleTime: 5 * 60 * 1000,
  });

  const currencyCode = (tenantSummary?.tenant?.primaryCurrency || "INR") as CurrencyCode;
  const symbol = CURRENCY_SYMBOLS[currencyCode] || "₹";
  const rate = EXCHANGE_RATES[currencyCode] || 1;

  // Convert INR value to active currency
  const convert = (valueInINR: number): number => {
    return valueInINR / rate;
  };

  // Format INR value to currency string (e.g. 1000 -> ₹1,000.00 or $12.05)
  const format = (valueInINR: number, decimals: number = 2): string => {
    const converted = convert(valueInINR);
    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  };

  // Format INR value without decimal points if integer (e.g. ₹1000 or $12)
  const formatCompact = (valueInINR: number): string => {
    const converted = convert(valueInINR);
    if (converted >= 1000000) {
      return `${symbol}${(converted / 1000000).toFixed(2)}M`;
    }
    if (converted >= 1000) {
      return `${symbol}${(converted / 1000).toFixed(1)}k`;
    }
    return `${symbol}${converted.toLocaleString(undefined, {
      maximumFractionDigits: 0
    })}`;
  };

  return {
    currencyCode,
    symbol,
    rate,
    convert,
    format,
    formatCompact
  };
}
