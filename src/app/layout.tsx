// Passthrough: <html lang> must follow the locale, so [locale]/layout.tsx and
// admin/layout.tsx render the document themselves.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
