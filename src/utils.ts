import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface MapDataPoint {
  id: string;
  name: string;
  value: number;
  trend: "up" | "down" | "stable";
  details?: string;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}
