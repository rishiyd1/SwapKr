import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return new Date(date).toLocaleDateString();
}

export function formatAcademicYear(year) {
  if (!year) return "";
  const yr = parseInt(year, 10);
  if (isNaN(yr)) return year; // fallback
  if (yr === 1) return "1st";
  if (yr === 2) return "2nd";
  if (yr === 3) return "3rd";
  return `${yr}th`;
}
