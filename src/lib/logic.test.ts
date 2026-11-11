import test from "node:test";
import assert from "node:assert/strict";
import { buildIcs } from "./ics.ts";
import { countConcerts, isUpcoming, splitEvents, todayInTimisoara, type EventLike } from "./events.ts";
import { needsParentalConsent, validateJoin, type JoinValues } from "./join.ts";
import { localized } from "./localized.ts";

const ev = (date: string, extra: Partial<EventLike> = {}): EventLike => ({ date, kind: "concert", status: "confirmed", ...extra });

test("ics: timed event uses Bucharest time and a VTIMEZONE", () => {
  const s = buildIcs({ id: "a", date: "2026-11-13", time: "19:00", title: "Concert, aniversar; 6", place: "Piața Traian 2, Timișoara" }, new Date("2026-01-01T00:00:00Z"));
  assert.match(s, /DTSTART;TZID=Europe\/Bucharest:20261113T190000\r\n/);
  assert.match(s, /DTEND;TZID=Europe\/Bucharest:20261113T210000\r\n/);
  assert.match(s, /BEGIN:VTIMEZONE/);
  assert.match(s, /SUMMARY:Concert\\, aniversar\\; 6\r\n/);
  assert.match(s, /DTSTAMP:20260101T000000Z/);
  assert.ok(s.endsWith("END:VCALENDAR\r\n"));
});

test("ics: all-day and multi-day events use an exclusive end date", () => {
  const s = buildIcs({ id: "b", date: "2026-07-16", end_date: "2026-07-19", title: "INCTC", place: "Timișoara" });
  assert.match(s, /DTSTART;VALUE=DATE:20260716/);
  assert.match(s, /DTEND;VALUE=DATE:20260720/);
  assert.doesNotMatch(s, /VTIMEZONE/);
});

test("ics: long lines fold at 75 octets without splitting diacritics", () => {
  const s = buildIcs({ id: "c", date: "2026-07-16", title: "ășțîâ".repeat(40), place: "x" });
  const enc = new TextEncoder();
  for (const line of s.split("\r\n")) assert.ok(enc.encode(line).length <= 75, line);
  assert.ok(s.replace(/\r\n /g, "").includes("ășțîâ".repeat(40)));
  assert.ok(!s.includes("�"));
});

test("events: split is upcoming first, an event is upcoming on its own day", () => {
  const { upcoming, past } = splitEvents([ev("2026-11-13"), ev("2026-12-01"), ev("2025-06-20"), ev("2026-07-16", { end_date: "2026-07-19" })], "2026-11-13");
  assert.deepEqual(upcoming.map((e) => e.date), ["2026-11-13", "2026-12-01"]);
  assert.deepEqual(past.map((e) => e.date), ["2026-07-16", "2025-06-20"]);
  assert.equal(isUpcoming(ev("2026-07-16", { end_date: "2026-07-19" }), "2026-07-18"), true);
});

test("events: today is computed in Timișoara, not UTC", () => {
  assert.equal(todayInTimisoara(new Date("2026-11-12T22:30:00Z")), "2026-11-13");
});

test("events: concert count drops past announced-only items and festivals", () => {
  const list = [ev("2025-01-01"), ev("2025-02-01", { status: "announced" }), ev("2026-12-01", { status: "announced" }), ev("2025-03-01", { kind: "festival" })];
  assert.equal(countConcerts(list, "2026-11-11"), 2);
});

const base: JoinValues = { name: "Ana Pop", phone: "0712 345 678", age: "20", voice: "alto", experience: "", instrument: "", message: "", parentalConsent: false, privacyConsent: true };

test("join: an adult needs only the privacy consent", () => {
  assert.deepEqual(validateJoin(base), []);
  assert.deepEqual(validateJoin({ ...base, privacyConsent: false }), ["privacyConsent"]);
});

test("join: under 18 needs a parent's consent, 18 does not, there is no minimum age", () => {
  assert.equal(needsParentalConsent("17"), true);
  assert.equal(needsParentalConsent("18"), false);
  assert.deepEqual(validateJoin({ ...base, age: "17" }), ["parentalConsent"]);
  assert.deepEqual(validateJoin({ ...base, age: "9", parentalConsent: true }), []);
});

test("join: invalid fields are reported", () => {
  assert.deepEqual(validateJoin({ ...base, name: " ", phone: "abc", age: "x", voice: "" }), ["name", "phone", "age", "voice"]);
});

test("localized: falls back to Romanian on missing or blank values", () => {
  assert.equal(localized({ ro: "Cor", en: "Choir" }, "en"), "Choir");
  assert.equal(localized({ ro: "Cor", it: "  " }, "it"), "Cor");
  assert.equal(localized({ ro: "Cor" }, "de"), "Cor");
  assert.equal(localized(null, "de"), "");
});
