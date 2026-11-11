import "./globals.css";
import { getDict } from "@/i18n";

const base = process.env.NEXT_PUBLIC_BASE_PATH;

export const metadata = { title: "404" };

export default function NotFound() {
  const t = getDict("ro").notFound;
  return (
    <html lang="ro">
      <body>
        <main className="frame grid min-h-svh content-center gap-6">
          <h1 className="title-page">{t.title}</h1>
          <p className="lead">{t.body}</p>
          <p>
            <a className="underline" href={`${base}/ro/`}>{t.back}</a>
            {" · "}
            <a className="underline" href={`${base}/en/`}>Home</a>
          </p>
        </main>
      </body>
    </html>
  );
}
