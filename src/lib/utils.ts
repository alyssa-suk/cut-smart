import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHeight(height: number, unit: string): string {
  if (unit === 'ft') {
    const feet = Math.floor(height);
    const inches = Math.round((height % 1) * 12);
    return `${feet} ft ${inches} in`;
  } else {
    return `${Math.round(height)} cm`;
  }
}
