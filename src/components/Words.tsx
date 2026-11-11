/** Heading text that a mask lifts off as it scrolls into view. */
export function Words({ text }: { text: string }) {
  return <span data-reveal className="block">{text}</span>;
}
