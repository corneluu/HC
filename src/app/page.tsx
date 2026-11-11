const target = `${process.env.NEXT_PUBLIC_BASE_PATH}/ro/`;

export const metadata = { title: "Corul „Harmonia Christi”", robots: { index: false } };

// GitHub Pages has no server redirects, so the root page forwards in the browser.
export default function RootRedirect() {
  return (
    <html lang="ro">
      <head>
        <meta httpEquiv="refresh" content={`0;url=${target}`} />
      </head>
      <body>
        <a href={target}>Corul „Harmonia Christi”</a>
      </body>
    </html>
  );
}
