import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withBasePath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path) {
    return base;
  }

  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  if (!base) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  if (path.startsWith(base + "/") || path === base) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${base}${path}`;
  }

  return `${base}/${path}`;
}
