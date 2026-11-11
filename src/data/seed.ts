// Static content the public pages render from. Sources and confidence labels are
// in the owner's research report; `status: "announced"` means the sources only
// announced it and nothing written afterwards confirms it took place.
import type { LText } from "../lib/localized.ts";
import type { ChoirEvent, CouncilMember, SiteData } from "./types.ts";

const L = (ro: string, en: string, it: string, de: string): LText => ({ ro, en, it, de });
const NONE: LText = { ro: "" };

const DOM = L("Domul Sf. Gheorghe, Timișoara", "St George's Cathedral, Timișoara", "Duomo di San Giorgio, Timișoara", "St.-Georgs-Dom, Timișoara");
const REGINA = L("Biserica Greco-Catolică „Regina Păcii”, Timișoara", "Queen of Peace Greek Catholic Church, Timișoara", "Chiesa greco-cattolica Regina della Pace, Timișoara", "Griechisch-katholische Kirche „Königin des Friedens“, Timișoara");
const SLATINA = L("Slatina-Timiș", "Slatina-Timiș", "Slatina-Timiș", "Slatina-Timiș");
const CHRISTMAS = L("Concert de Crăciun", "Christmas concert", "Concerto di Natale", "Weihnachtskonzert");
const CAROLS = L("Concert de colinde", "Carol concert", "Concerto di canti natalizi", "Weihnachtsliederkonzert");
const TOUR = L("Turneul din Moldova", "Moldova tour", "Tournée in Moldavia", "Moldau-Tournee");
const FREE = L("Intrarea este liberă.", "Free entry.", "Ingresso libero.", "Eintritt frei.");

type Row = Omit<ChoirEvent, "position" | "poster" | "note" | "end_date" | "time" | "status"> &
  Partial<Pick<ChoirEvent, "note" | "end_date" | "time" | "status">>;

const rows: Row[] = [
  { id: "colinde-2021", date: "2021-12-19", kind: "concert", title: CAROLS, place: REGINA },
  { id: "colinde-2023", date: "2023-12-19", kind: "concert", title: L("Recital de colinde", "Carol recital", "Recital di canti natalizi", "Weihnachtslieder-Rezital"), place: REGINA },
  { id: "moldova-slanic-biserica", date: "2024-04-27", kind: "concert", title: L("Primul concert din turneul prin Moldova", "First concert of the Moldova tour", "Primo concerto della tournée in Moldavia", "Erstes Konzert der Moldau-Tournee"), place: L("Biserica Catolică, Slănic-Moldova", "Catholic Church, Slănic-Moldova", "Chiesa cattolica, Slănic-Moldova", "Katholische Kirche, Slănic-Moldova"), note: L("O biserică plină, la primul nostru turneu național.", "A full church, on our first national tour.", "Una chiesa piena, alla nostra prima tournée nazionale.", "Eine volle Kirche auf unserer ersten Tournee durch das Land.") },
  { id: "moldova-slanic-foisor", date: "2024-04-28", kind: "concert", title: L("Recital în aer liber", "Open-air recital", "Recital all'aperto", "Open-Air-Rezital"), place: L("Foișorul din Parcul Central, Slănic-Moldova", "Bandstand in Central Park, Slănic-Moldova", "Chiosco del Parco Centrale, Slănic-Moldova", "Musikpavillon im Zentralpark, Slănic-Moldova"), note: TOUR },
  { id: "moldova-ciresoaia", date: "2024-04-30", time: "20:00", kind: "concert", title: L("Concert în biserica din Cireșoaia", "Concert at the church in Cireșoaia", "Concerto nella chiesa di Cireșoaia", "Konzert in der Kirche von Cireșoaia"), place: L("Cireșoaia", "Cireșoaia", "Cireșoaia", "Cireșoaia"), note: L("Turneul din Moldova, cu soprana Maria Miler invitată.", "Moldova tour, with guest soprano Maria Miler.", "Tournée in Moldavia, con il soprano ospite Maria Miler.", "Moldau-Tournee, mit der Sopranistin Maria Miler als Gast.") },
  { id: "craciun-slatina-2024", date: "2024-12-07", kind: "concert", title: CHRISTMAS, place: SLATINA },
  { id: "craciun-dom-2024", date: "2024-12-15", time: "19:30", kind: "concert", title: CHRISTMAS, place: DOM, note: FREE },
  { id: "concertul-sperantei-2025", date: "2025-03-21", kind: "concert", title: L("Concertul speranței", "Concert of Hope", "Concerto della speranza", "Konzert der Hoffnung"), place: L("Biserica „Duminica Tuturor Sfinților”, Oradea", "All Saints' Sunday Church, Oradea", "Chiesa della Domenica di Tutti i Santi, Oradea", "Allerheiligen-Sonntag-Kirche, Oradea"), note: L("Invitați speciali ai Comunității Don Orione, alături de Anima Nostra, Golden Angels și Ghitariștii Don Orione.", "Special guests of the Don Orione Community, alongside Anima Nostra, Golden Angels and the Don Orione Guitarists.", "Ospiti speciali della Comunità Don Orione, insieme ad Anima Nostra, Golden Angels e ai Chitarristi Don Orione.", "Besondere Gäste der Don-Orione-Gemeinschaft, gemeinsam mit Anima Nostra, Golden Angels und den Don-Orione-Gitarristen.") },
  { id: "festivalul-tinerilor-2025", date: "2025-05-17", time: "17:00", status: "announced", kind: "concert", title: L("Concertul de încheiere al Festivalului Tinerilor", "Closing concert of the Youth Festival", "Concerto di chiusura del Festival dei Giovani", "Abschlusskonzert des Jugendfestivals"), place: L("Parcul Rozelor, Timișoara", "Rose Park, Timișoara", "Parco delle Rose, Timișoara", "Rosenpark, Timișoara") },
  { id: "aniversar-5-ani", date: "2025-06-20", time: "19:00", kind: "concert", title: L("Concert aniversar: 5 ani", "Anniversary concert: 5 years", "Concerto per i 5 anni", "Jubiläumskonzert: 5 Jahre"), place: L("Cinema Timiș, Piața Victoriei 7, Timișoara", "Cinema Timiș, Piața Victoriei 7, Timișoara", "Cinema Timiș, Piața Victoriei 7, Timișoara", "Cinema Timiș, Piața Victoriei 7, Timișoara"), note: L("Cor și band, și lansarea primului nostru album, „În iubire să trăim!”.", "Choir and band, and the launch of our first album, „În iubire să trăim!”.", "Coro e band, e il lancio del nostro primo album, „În iubire să trăim!”.", "Chor und Band, dazu die Vorstellung unseres ersten Albums „În iubire să trăim!“.") },
  { id: "targ-craciun-2025", date: "2025-12-10", status: "announced", kind: "concert", title: L("Târgul de Crăciun din Timișoara", "Timișoara Christmas Market", "Mercatino di Natale di Timișoara", "Weihnachtsmarkt Timișoara"), place: L("Târgul de Crăciun, Timișoara", "Christmas Market, Timișoara", "Mercatino di Natale, Timișoara", "Weihnachtsmarkt, Timișoara") },
  { id: "craciun-dom-2025", date: "2025-12-14", time: "19:30", kind: "concert", title: L("Concert de Crăciun „S-a născut Cristos”", "Christmas concert „S-a născut Cristos”", "Concerto di Natale „S-a născut Cristos”", "Weihnachtskonzert „S-a născut Cristos“"), place: DOM, note: L("Cor, orchestră și band, cu violonista Melinda Dumitrescu invitată.", "Choir, orchestra and band, with guest violinist Melinda Dumitrescu.", "Coro, orchestra e band, con la violinista ospite Melinda Dumitrescu.", "Chor, Orchester und Band, mit der Geigerin Melinda Dumitrescu als Gast.") },
  { id: "craciun-rusca-2025", date: "2025-12-20", time: "18:00", kind: "concert", title: CHRISTMAS, place: L("Biserica „Sf. Bernard de Clairvaux”, Rusca Montană", "St Bernard of Clairvaux Church, Rusca Montană", "Chiesa di San Bernardo di Chiaravalle, Rusca Montană", "Kirche St. Bernhard von Clairvaux, Rusca Montană"), note: L("Un mulțumesc comunității care a ajutat la renovarea bisericii.", "A thank-you to the community that helped renovate the church.", "Un grazie alla comunità che ha aiutato a restaurare la chiesa.", "Ein Dank an die Gemeinde, die bei der Renovierung der Kirche geholfen hat.") },
  { id: "craciun-slatina-2025", date: "2025-12-21", time: "17:00", status: "announced", kind: "concert", title: CHRISTMAS, place: SLATINA },
  { id: "festivalul-tinerilor-2026", date: "2026-05-16", time: "13:45", kind: "concert", title: L("Concert la Festivalul Tinerilor", "Concert at the Youth Festival", "Concerto al Festival dei Giovani", "Konzert beim Jugendfestival"), place: L("Muzeul de Transport Public „Corneliu Miklosi”, Timișoara", "„Corneliu Miklosi” Public Transport Museum, Timișoara", "Museo del Trasporto Pubblico „Corneliu Miklosi”, Timișoara", "Museum für öffentlichen Verkehr „Corneliu Miklosi“, Timișoara"), note: L("Cu bandul nostru.", "With our band.", "Con la nostra band.", "Mit unserer Band.") },
  { id: "inctc-2026", date: "2026-07-16", end_date: "2026-07-19", kind: "festival", title: L("Întâlnirea Națională a Corurilor de Tineret Catolice", "National Meeting of Catholic Youth Choirs", "Incontro nazionale dei cori giovanili cattolici", "Nationales Treffen der katholischen Jugendchöre"), place: L("Timișoara", "Timișoara", "Timișoara", "Timișoara"), note: L("Prima ediție, pe care am avut bucuria să o găzduim.", "The first edition, which we had the joy of hosting.", "La prima edizione, che abbiamo avuto la gioia di ospitare.", "Die erste Ausgabe, die wir mit Freude ausgerichtet haben.") },
  { id: "hubic-2026", date: "2026-10-23", time: "19:30", kind: "festival", title: L("Festivalul Coral „Francisc Hubic”, ediția a XVI-a", "„Francisc Hubic” Choral Festival, 16th edition", "Festival corale „Francisc Hubic”, XVI edizione", "Chorfestival „Francisc Hubic“, 16. Ausgabe"), place: L("Catedrala Greco-Catolică „Sfântul Nicolae”, Oradea", "St Nicholas Greek Catholic Cathedral, Oradea", "Cattedrale greco-cattolica di San Nicola, Oradea", "Griechisch-katholische Kathedrale St. Nikolaus, Oradea"), note: L("Am cântat „Sufletul meu te dorește”.", "We sang „Sufletul meu te dorește”.", "Abbiamo cantato „Sufletul meu te dorește”.", "Wir haben „Sufletul meu te dorește“ gesungen.") },
  { id: "aniversar-6-ani", date: "2026-11-13", time: "19:00", status: "announced", kind: "concert", title: L("Concert aniversar: 6 ani de Harmonia Christi", "Anniversary concert: 6 years of Harmonia Christi", "Concerto per i 6 anni di Harmonia Christi", "Jubiläumskonzert: 6 Jahre Harmonia Christi"), place: L("Biserica Millennium, Piața Traian 2, Timișoara", "Millennium Church, Piața Traian 2, Timișoara", "Chiesa Millennium, Piața Traian 2, Timișoara", "Millennium-Kirche, Piața Traian 2, Timișoara"), note: L("Cor și orchestră. Intrarea este liberă.", "Choir and orchestra. Free entry.", "Coro e orchestra. Ingresso libero.", "Chor und Orchester. Eintritt frei.") },
];

const events: ChoirEvent[] = rows.map((r, i) => ({
  note: NONE, end_date: null, time: null, status: "confirmed", ...r, poster: null, position: i,
}));

const VOICE = {
  dirijor: L("dirijor", "conductor", "direttore", "Dirigent"),
  sopran: L("sopran", "soprano", "soprano", "Sopran"),
  alto: L("alto", "alto", "contralto", "Alt"),
  bas: L("bas", "bass", "basso", "Bass"),
};

const member = (id: string, name: string, role: LText, position: number): CouncilMember =>
  ({ id, name, role, age: null, description: NONE, portrait: null, position });

const council: CouncilMember[] = [
  member("iustin-calin", "Iustin Călin", VOICE.dirijor, 0),
  member("erika-maria", "Sora Erika-Maria", VOICE.sopran, 1),
  member("roxana-mitrica", "Roxana Mitrică", VOICE.sopran, 2),
  member("loredana-farcas", "Loredana Farcaș", VOICE.sopran, 3),
  member("loredana-mitrica", "Loredana Mitrică", VOICE.alto, 4),
  member("claudiu-kocsis", "Kocsis Claudiu Andras", VOICE.bas, 5),
  member("cornel-miron", "Miron Cornel-Iosif", VOICE.bas, 6),
  member("ovidiu-busuioc", "Ovidiu Busuioc", VOICE.bas, 7),
];

const CONCERT_ALBUM = "concert-5-ani";

const photo = (src: string, alt: LText, position: number) => ({
  id: src.replace("/", "-"), album_id: CONCERT_ALBUM, src: `concert-5-ani/${src}`, alt, width: null, height: null, position,
});

export const seed: SiteData = {
  events,
  council,
  videos: [
    { id: "cerul", youtube_id: "XBEmKDywJTk", title: { ro: "Cerul e în inima mea" }, position: 0 },
    { id: "in-veci", youtube_id: "4mOCxM-HM4c", title: { ro: "În veci voi cânta a Ta milostivire" }, position: 1 },
    { id: "vino", youtube_id: "QIx1BQDLkxQ", title: { ro: "Vino și urmează-mă" }, position: 2 },
  ],
  albums: [
    { id: CONCERT_ALBUM, slug: CONCERT_ALBUM, title: L("Concertul aniversar de 5 ani", "The 5th anniversary concert", "Il concerto per i 5 anni", "Das Konzert zum 5. Jubiläum"), description: L("Cinema Timiș, 20 iunie 2025", "Cinema Timiș, 20 June 2025", "Cinema Timiș, 20 giugno 2025", "Cinema Timiș, 20. Juni 2025"), position: 0 },
  ],
  photos: [
    photo("grup-scena", L("Tot corul și bandul pe scenă, sub numele Harmonia Christi proiectat în spate", "The whole choir and band on stage, with the name Harmonia Christi projected behind them", "Tutto il coro e la band sul palco, con il nome Harmonia Christi proiettato alle spalle", "Der ganze Chor und die Band auf der Bühne, dahinter der projizierte Name Harmonia Christi"), 0),
    photo("voci-si-band", L("Fetele în galben și băieții în verde cântă, cu bandul în față", "Girls in yellow and boys in green singing, with the band in front", "Le ragazze in giallo e i ragazzi in verde cantano, con la band davanti", "Mädchen in Gelb und Jungen in Grün singen, davor die Band"), 1),
    photo("alelia-dirijat", L("Corul dirijat în fața ecranului pe care scrie Aleluia", "The choir being conducted in front of a screen reading Alleluia", "Il coro diretto davanti allo schermo con la scritta Alleluia", "Der Chor wird vor der Leinwand mit dem Schriftzug Halleluja dirigiert"), 2),
    photo("baieti-grup", L("Vocile bărbătești, în tricouri verzi cu inimă albă", "The men's voices, in green T-shirts with a white heart", "Le voci maschili, in maglietta verde con un cuore bianco", "Die Männerstimmen in grünen T-Shirts mit weißem Herzen"), 3),
    photo("grup-aplauze", L("Corul pe scenă, la finalul concertului", "The choir on stage at the end of the concert", "Il coro sul palco alla fine del concerto", "Der Chor auf der Bühne am Ende des Konzerts"), 4),
    photo("baieti-cantand", L("Băieții cântă strânși în jurul microfonului", "The boys sing, gathered round the microphone", "I ragazzi cantano stretti attorno al microfono", "Die Jungen singen dicht um das Mikrofon"), 5),
    photo("alelia-cor", L("Cor și instrumentiști sub proiecția Aleluia", "Choir and instrumentalists under the Alleluia projection", "Coro e strumentisti sotto la proiezione Alleluia", "Chor und Instrumentalisten unter der Halleluja-Projektion"), 6),
    photo("voci-si-band-2", L("Voci și instrumente într-un singur cânt", "Voices and instruments in a single song", "Voci e strumenti in un solo canto", "Stimmen und Instrumente in einem einzigen Lied"), 7),
    photo("sala-mare", L("Cuvânt adresat publicului, cu tot corul în spate", "A word to the audience, with the whole choir behind", "Una parola al pubblico, con tutto il coro alle spalle", "Ein Wort an das Publikum, der ganze Chor dahinter"), 8),
  ],
  settings: {
    founding_date: "",
    years_active: 6,
    iban: "",
    donation_beneficiary: "Asociația Culturală „Artistul de Mâine”",
    tours: [
      { name: "Moldova", year: 2024 },
      { name: "Italia", year: 2026 },
      { name: "Međugorje", year: null },
    ],
    conductor_name: "Iustin Călin",
    conductor_photo: "dirijor/la-pupitru",
    conductor_bio: L(
      "Prof. Iustin Călin este cel care a adunat corul, în timpul pandemiei, și de atunci îl dirijează. Predă muzica la Liceul Teologic Romano-Catolic Gerhardinum din Timișoara și este președintele Asociației Culturale „Artistul de Mâine”. În 2024 ne-a condus în primul turneu național, prin Moldova, unde a cântat și arii de operă alături de soprana Maria Miler. Tot de la el a pornit, în septembrie 2025, propunerea primei Întâlniri Naționale a Corurilor de Tineret Catolice, găzduită la Timișoara în iulie 2026.",
      "Prof. Iustin Călin is the one who brought the choir together during the pandemic, and he has conducted it ever since. He teaches music at the Gerhardinum Roman Catholic Theological High School in Timișoara and is president of the „Artistul de Mâine” Cultural Association. In 2024 he led us on our first national tour, through Moldova, where he also sang opera arias with soprano Maria Miler. It was also his proposal, in September 2025, that led to the first National Meeting of Catholic Youth Choirs, hosted in Timișoara in July 2026.",
      "Il prof. Iustin Călin è colui che ha radunato il coro durante la pandemia e da allora lo dirige. Insegna musica al Liceo Teologico Romano-Cattolico Gerhardinum di Timișoara ed è presidente dell'Associazione Culturale „Artistul de Mâine”. Nel 2024 ci ha guidati nella prima tournée nazionale, in Moldavia, dove ha cantato anche arie d'opera con il soprano Maria Miler. È partita da lui, nel settembre 2025, la proposta del primo Incontro nazionale dei cori giovanili cattolici, ospitato a Timișoara nel luglio 2026.",
      "Prof. Iustin Călin hat den Chor während der Pandemie zusammengebracht und leitet ihn seither. Er unterrichtet Musik am römisch-katholischen theologischen Gymnasium Gerhardinum in Timișoara und ist Präsident des Kulturvereins „Artistul de Mâine“. 2024 führte er uns auf unsere erste Tournee durch das Land, in die Moldau, wo er zusammen mit der Sopranistin Maria Miler auch Opernarien sang. Von ihm kam im September 2025 auch der Vorschlag für das erste Nationale Treffen der katholischen Jugendchöre, das im Juli 2026 in Timișoara stattfand.",
    ),
  },
};
