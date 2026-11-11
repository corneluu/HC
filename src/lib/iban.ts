/** ISO 13616 mod-97 check. Stops a typo from being published as the donation account. */
export function isValidIban(raw: string): boolean {
  const iban = raw.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  const digits = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  return remainder === 1;
}
