import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetcher<T>(...args: [string]): Promise<T> {
  const res = await fetch(...args);
  return res.json() as Promise<T>;
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function slugify(title: string): string {
  return title
    .split(/\s+/)
    .slice(0, 3)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, "")
    .replace(/^-|-$/g, "");
}

export function generateSlug(title: string): string {
  const slug = slugify(title);
  const suffix = nanoid(4);

  return `${slug}~${suffix}`;
}
