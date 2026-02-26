import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isOverdue(dueDate: Date | string) {
  return new Date(dueDate) < new Date();
}

export function getDueDateFromBorrowDate(borrowedAt: Date = new Date()) {
  const due = new Date(borrowedAt);
  due.setDate(due.getDate() + 14);
  return due;
}
