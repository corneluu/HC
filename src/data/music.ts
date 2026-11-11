export const SPOTIFY_ARTIST_ID = "1BS2AlY0yUZqOgg6ESFU7T";

export const MUSIC_ALBUMS = [
  {
    title: "În iubire să trăim!",
    released: "2025-06-22",
    tracks: 15,
    spotifyAlbumId: "6EhHIzg0u94lGwBZXvuDHr",
    apple: "https://music.apple.com/us/album/in-iubire-sa-traim/1822595821",
    deezer: "https://www.deezer.com/album/777236881",
  },
  {
    title: "Your love makes me sing",
    released: "2025-10-26",
    tracks: 10,
    // The research could not confirm a Spotify album page for this one, so no embed: never guess an id.
    spotifyAlbumId: null,
    apple: "https://music.apple.com/us/album/your-love-makes-me-sing/1849552260",
    deezer: "https://www.deezer.com/album/844759672",
  },
] as const;

export const TOTAL_TRACKS = MUSIC_ALBUMS.reduce((sum, a) => sum + a.tracks, 0);

export const CONTACT = {
  phoneDisplay: "0753 590 671",
  phoneHref: "tel:+40753590671",
  conductor: "Iustin Călin",
  facebook: "https://www.facebook.com/corulhc",
  instagram: "https://www.instagram.com/corulharmoniachristi4/",
  tiktok: "https://www.tiktok.com/@corul.hc",
  youtube: "https://www.youtube.com/@corulharmoniachristi372",
};

export const CONCERT_VIDEO_5_ANI = "dGaHGKs0-IQ";

export const ITALY_POSTS = [
  { date: "2026-02-28", text: "Il torneo sta arrivando", url: "https://www.tiktok.com/@corul.hc/video/7611876110036438294" },
  { date: "2026-03-17", text: "Turneu în Itaaliaa", url: "https://www.tiktok.com/@corul.hc/video/7618208508424523030" },
  { date: "2026-03-19", text: "Unde mergem să mâncăm niște paste?!", url: "https://www.tiktok.com/@corul.hc/video/7618983931534216470" },
  { date: "2026-03-24", text: "#trend #italy", url: "https://www.tiktok.com/@corul.hc/video/7620804043195075862" },
];
