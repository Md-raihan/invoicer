import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const generateInvoiceNumber = (lastNumber: string) => {
  if (!lastNumber) return "INV-0001";
  const num = parseInt(lastNumber.split("-")[1], 10);
  return `INV-${String(num + 1).padStart(4, "0")}`;
};
