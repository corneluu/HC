/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- static export: variants are generated ahead of time */
import manifest from "@/data/photos.generated.json";
import { asset } from "@/lib/site";

type Entry = { w: number; h: number; widths: number[]; color: string };
const photos = manifest as Record<string, Entry>;

type Props = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export function Photo({ src, alt, sizes = "100vw", className, priority }: Props) {
  const entry = photos[src];
  const common = {
    alt, className,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
    fetchPriority: priority ? ("high" as const) : undefined,
  };

  if (!entry) {
    // Only https storage URLs from the admin panel reach an <img>.
    if (!/^https:\/\//.test(src)) return null;
    return <img src={src} {...common} />;
  }

  const set = (ext: string) => entry.widths.map((w) => `${asset(`/photos/${src}-${w}.${ext}`)} ${w}w`).join(", ");
  const largest = entry.widths[entry.widths.length - 1];
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img src={asset(`/photos/${src}-${largest}.webp`)} width={entry.w} height={entry.h} style={{ backgroundColor: entry.color }} {...common} />
    </picture>
  );
}
