export type IcsInput = {
  id: string;
  date: string; // YYYY-MM-DD
  end_date?: string | null;
  time?: string | null; // HH:MM
  title: string;
  place: string;
  description?: string;
};

const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545 folding: lines of at most 75 octets, continuation lines start with a space. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const n = encoder.encode(ch).length;
    if (size + n > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += n;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const compact = (date: string) => date.replaceAll("-", "");

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const VTIMEZONE = [
  "BEGIN:VTIMEZONE", "TZID:Europe/Bucharest",
  "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0300", "TZNAME:EEST", "DTSTART:19700329T030000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
  "BEGIN:STANDARD", "TZOFFSETFROM:+0300", "TZOFFSETTO:+0200", "TZNAME:EET", "DTSTART:19701025T040000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
  "END:VTIMEZONE",
];

export function buildIcs(e: IcsInput, now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  let when: string[];
  if (e.time) {
    const hhmm = e.time.replace(":", "").slice(0, 4);
    const start = `${compact(e.date)}T${hhmm}00`;
    // No end time in the data: assume a two-hour concert.
    const endHour = Number(hhmm.slice(0, 2)) + 2;
    const end = endHour < 24
      ? `${compact(e.date)}T${String(endHour).padStart(2, "0")}${hhmm.slice(2)}00`
      : `${compact(addDays(e.date, 1))}T${String(endHour - 24).padStart(2, "0")}${hhmm.slice(2)}00`;
    when = [`DTSTART;TZID=Europe/Bucharest:${start}`, `DTEND;TZID=Europe/Bucharest:${end}`];
  } else {
    // DTEND of an all-day event is exclusive.
    when = [`DTSTART;VALUE=DATE:${compact(e.date)}`, `DTEND;VALUE=DATE:${compact(addDays(e.end_date || e.date, 1))}`];
  }
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Corul Harmonia Christi//RO", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    ...(e.time ? VTIMEZONE : []),
    "BEGIN:VEVENT", `UID:${e.id}@corul-harmonia-christi`, `DTSTAMP:${stamp}`, ...when,
    `SUMMARY:${escapeText(e.title)}`, `LOCATION:${escapeText(e.place)}`,
    ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
    "END:VEVENT", "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
