// src/utils/dateUtils.ts

export const formatDate = (
  timestamp: number,
  format: "short" | "long" | "relative" = "short"
): string => {
  const date = new Date(timestamp);
  const now = new Date();

  if (format === "relative") {
    return getRelativeTime(timestamp);
  }

  if (format === "long") {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (timestamp: number): string => {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
};

export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};

export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export const getStartOfDay = (timestamp: number = Date.now()): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const getEndOfDay = (timestamp: number = Date.now()): number => {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

export const getDaysAgo = (days: number): number => {
  const now = Date.now();
  return now - days * 24 * 60 * 60 * 1000;
};

export const getDaysFromNow = (days: number): number => {
  const now = Date.now();
  return now + days * 24 * 60 * 60 * 1000;
};

export const groupByDate = <T extends { createdAt: number }>(
  items: T[]
): Record<string, T[]> => {
  const groups: Record<string, T[]> = {};

  items.forEach((item) => {
    const dateKey = getTodayString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
  });

  return groups;
};

export const sortByDate = <T extends { createdAt: number }>(
  items: T[],
  order: "asc" | "desc" = "desc"
): T[] => {
  return [...items].sort((a, b) => {
    return order === "desc"
      ? b.createdAt - a.createdAt
      : a.createdAt - b.createdAt;
  });
};
