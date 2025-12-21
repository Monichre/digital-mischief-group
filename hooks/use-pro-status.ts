
"use client";

import { getUserProStatus } from "@/app/actions/user";
import useSWR from "swr";

export function useProStatus() {
  const { data, error, isLoading } = useSWR("userProStatus", getUserProStatus);

  return {
    isPro: data,
    isLoading,
    isError: error,
  };
}
