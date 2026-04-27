import { useEffect, useRef } from "react";
import { supabase } from "./supabase";

export function useRealtimeEvents(onRefresh: () => void) {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => onRefreshRef.current()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => onRefreshRef.current()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}
