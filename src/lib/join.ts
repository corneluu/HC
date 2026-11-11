export type JoinValues = {
  name: string;
  phone: string;
  age: string;
  voice: string;
  experience: string;
  instrument: string;
  message: string;
  parentalConsent: boolean;
  privacyConsent: boolean;
};

export type JoinErrorKey = "name" | "phone" | "age" | "voice" | "parentalConsent" | "privacyConsent";

export function parseAge(age: string): number | null {
  const trimmed = age.trim();
  if (!/^\d{1,3}$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return n >= 1 && n <= 120 ? n : null;
}

/** No minimum age: anyone under 18 simply needs a parent's agreement. */
export const needsParentalConsent = (age: string) => {
  const n = parseAge(age);
  return n !== null && n < 18;
};

export function validateJoin(v: JoinValues): JoinErrorKey[] {
  const errors: JoinErrorKey[] = [];
  if (v.name.trim().length < 2) errors.push("name");
  if (v.phone.replace(/\D/g, "").length < 9 || !/^[+\d\s().-]+$/.test(v.phone.trim())) errors.push("phone");
  if (parseAge(v.age) === null) errors.push("age");
  if (!v.voice) errors.push("voice");
  if (needsParentalConsent(v.age) && !v.parentalConsent) errors.push("parentalConsent");
  if (!v.privacyConsent) errors.push("privacyConsent");
  return errors;
}
