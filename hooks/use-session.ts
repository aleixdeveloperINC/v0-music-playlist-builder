import useSWR from "swr";
import type { Session } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR<Session>(
    "/api/auth/session",
    fetcher
  );

  return {
    session: data,
    user: data?.user ?? null,
    accessToken: data?.accessToken,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
    mutate,
  };
}
