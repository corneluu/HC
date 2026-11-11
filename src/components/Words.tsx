/** Heading or statement whose words rise into place on scroll. */
export function Words({ text }: { text: string }) {
  return (
    <span data-words className="block">
      {text.split(" ").map((word, i, all) => (
        <span key={i}>
          <span className="word">
            <span style={{ "--i": i } as React.CSSProperties}>{word}</span>
          </span>
          {i < all.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
