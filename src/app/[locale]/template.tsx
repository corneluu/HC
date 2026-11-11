// A template remounts on every navigation, which replays the page entrance.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
