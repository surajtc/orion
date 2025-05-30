import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { useSession } from "@/app/(auth)/auth-client";

export async function localStorageFetcher<T>(key: string): Promise<T> {
  if (typeof window === "undefined") {
    throw new Error("localStorage is not available on the server");
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    throw new Error(`No local data for key: ${key}`);
  }

  return JSON.parse(raw) as T;
}

export function useSmartSWR<T>(key: string) {
  const { data: session } = useSession();
  const isGuest = !session?.user?.id;

  const swr = useSWR<T>(key, isGuest ? localStorageFetcher : fetcher);

  return swr;
}
