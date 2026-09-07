// Récupération de VRAIES photos (pas de placeholder aléatoire) via l'API publique
// et gratuite de Wikimedia Commons — aucune clé API requise (origin=* → CORS ouvert).
// Utilisé à la création/édition d'une pièce quand aucune URL d'image n'est fournie manuellement.

const FALLBACK_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Car_parts.jpg/500px-Car_parts.jpg";

// Traduit les noms de pièces (saisis en français) vers une requête de recherche
// efficace sur Wikimedia Commons (majoritairement indexé en anglais).
const QUERY_TRANSLATIONS: Record<string, string> = {
  plaquette: "brake pad",
  "disque de frein": "brake disc",
  frein: "car brake",
  "filtre à huile": "oil filter",
  "filtre à air": "air filter",
  "filtre habitacle": "cabin air filter",
  filtre: "automotive filter",
  amortisseur: "shock absorber car",
  bougie: "spark plug",
  "courroie de distribution": "timing belt",
  courroie: "drive belt car",
  batterie: "car battery",
  alternateur: "car alternator",
  radiateur: "car radiator",
  "pompe à eau": "water pump car engine",
  embrayage: "clutch kit car",
  rétroviseur: "car side mirror",
  phare: "car headlight",
  "pare-choc": "car bumper",
  silencieux: "car exhaust muffler",
  échappement: "car exhaust system",
  compresseur: "car ac compressor",
  climatisation: "car air conditioning compressor",
  "capteur abs": "abs sensor car",
  "rotule de direction": "tie rod end car",
  pneu: "car tire",
  jante: "car wheel rim",
  "essuie-glace": "windshield wiper",
  démarreur: "car starter motor",
  turbo: "turbocharger",
};

function toSearchQuery(partName: string): string {
  const lower = partName.toLowerCase();
  for (const [fr, en] of Object.entries(QUERY_TRANSLATIONS)) {
    if (lower.includes(fr)) return en;
  }
  return `${partName} auto part`;
}

export async function fetchRealPartPhoto(partNameOrQuery: string): Promise<string> {
  const query = toSearchQuery(partNameOrQuery);
  try {
    const url =
      "https://commons.wikimedia.org/w/api.php?" +
      new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: `filetype:bitmap ${query}`,
        gsrnamespace: "6",
        gsrlimit: "6",
        prop: "imageinfo",
        iiprop: "url|mime",
        iiurlwidth: "600",
        format: "json",
        origin: "*",
      }).toString();

    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
    if (!res.ok) return FALLBACK_IMAGE;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return FALLBACK_IMAGE;

    const candidates = Object.values(pages) as any[];
    const photo = candidates.find((p) => {
      const mime = p?.imageinfo?.[0]?.mime as string | undefined;
      return mime && (mime.includes("jpeg") || mime.includes("png"));
    });
    const info = (photo || candidates[0])?.imageinfo?.[0];
    return info?.thumburl || info?.url || FALLBACK_IMAGE;
  } catch {
    return FALLBACK_IMAGE;
  }
}
