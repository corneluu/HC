import "../globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = { title: "Admin | Corul „Harmonia Christi”", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="bg-surface">
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
