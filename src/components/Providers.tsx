"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { seed } from "@/data/seed";
import type { SiteData } from "@/data/types";
import { todayInTimisoara } from "@/lib/events";

const SiteDataContext = createContext<SiteData>(seed);
export const useSiteData = () => useContext(SiteDataContext);

const noSubscribe = () => () => {};
/** Build date while hydrating, then the real date, so upcoming/past follows the clock on a static site. */
export const useToday = () =>
  useSyncExternalStore(noSubscribe, todayInTimisoara, () => process.env.NEXT_PUBLIC_BUILD_DATE as string);

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="bottom-center" theme={resolvedTheme === "dark" ? "dark" : "light"} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData>(seed);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    let cancelled = false;
    // Any failure keeps the seed already on screen.
    import("@/lib/live-data")
      .then(({ fetchLiveData }) => fetchLiveData(seed))
      .then((live) => { if (!cancelled) setData(live); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>
      <ThemedToaster />
    </ThemeProvider>
  );
}
