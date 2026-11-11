export type EventLike = {
  date: string; // YYYY-MM-DD, Timișoara local
  end_date?: string | null;
  time?: string | null;
  kind: "concert" | "festival";
  status: "confirmed" | "announced";
  position?: number;
};

/** Today's date in Timișoara as YYYY-MM-DD, whatever the visitor's clock zone. */
export function todayInTimisoara(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(now);
}

/** An event stays "upcoming" through its last day. */
export const isUpcoming = (e: EventLike, today: string) => (e.end_date || e.date) >= today;

export function splitEvents<T extends EventLike>(events: T[], today: string) {
  const order = (a: T, b: T) => a.date.localeCompare(b.date) || (a.position ?? 0) - (b.position ?? 0);
  return {
    upcoming: events.filter((e) => isUpcoming(e, today)).sort(order),
    past: events.filter((e) => !isUpcoming(e, today)).sort((a, b) => -order(a, b)),
  };
}

/** Concerts we can stand behind: held and confirmed, or still ahead of us. */
export function countConcerts(events: EventLike[], today: string): number {
  return events.filter((e) => e.kind === "concert" && (e.status === "confirmed" || isUpcoming(e, today))).length;
}
