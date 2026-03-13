// Short key -> { display name, icon }
export const CATEGORIES: Record<string, { display: string; icon: string; description: string }> = {
  core: { display: "Grundlagen & Mathematische Theorie", icon: "📕", description: "Die mathematischen und logischen Fundamente der KI." },
  ml: { display: "Klassisches Maschinelles Lernen", icon: "🤖", description: "Algorithmen, die aus Daten lernen, von Regression bis SVM." },
  dl: { display: "Deep Learning & Neuronale Netze", icon: "🧬", description: "Komplexe Netzwerke, inspiriert durch das menschliche Gehirn." },
  rl: { display: "Reinforcement Learning & Agenten-Systeme", icon: "🎮", description: "Lernen durch Interaktion, Belohnung und Bestrafung." },
  genai: { display: "Generative KI & Foundation Models", icon: "🎨", description: "KI-Modelle, die Texte, Bilder und Musik selbst erschaffen." },
  nlp: { display: "Natural Language Processing (NLP)", icon: "💬", description: "Wie Computer unsere menschliche Sprache verstehen lernen." },
  cv: { display: "Computer Vision & Bildverarbeitung", icon: "👁️", description: "Das Sehen und Verstehen von visuellen Inhalten durch KI." },
  audio: { display: "Audio-, Sprach- & Musikverarbeitung", icon: "🎧", description: "Analyse und Synthese von akustischen Signalen." },
  robotics: { display: "Robotik & Embodied AI", icon: "🦾", description: "KI in physischen Körpern, die mit der Welt interagieren." },
  data: { display: "Daten, Datensätze & Infrastruktur", icon: "📊", description: "Das Fundament: Wie Daten gesammelt und verarbeitet werden." },
  deployment: { display: "MLOps, Engineering & Hardware", icon: "🏗️", description: "KI in die Produktion bringen und effizient betreiben." },
  apps: { display: "Branchen & Praktische Anwendungen", icon: "🚀", description: "Wie KI die Medizin, Industrie und den Alltag verändert." },
  ethics: { display: "Ethik, Sicherheit & KI-Alignment", icon: "⚖️", description: "Verantwortungsvoller Umgang und Sicherheit von KI-Systemen." },
  history: { display: "Geschichte, Akteure & Organisationen", icon: "📜", description: "Die Meilensteine und Pioniere der KI-Entwicklung." }
};

export const HEADER_CATEGORIES: Record<string, string[]> = {
  "Fundament & Lernmethoden": ["core", "ml", "dl", "rl"],
  "Modalitäten & Modelle": ["genai", "nlp", "cv", "audio"],
  "Praxis, Engineering & Hardware": ["robotics", "data", "deployment"],
  "Anwendung & Gesellschaft": ["apps", "ethics", "history"]
};

// For backward compatibility and specialized icon lookup
export const categoryIcons: Record<string, string> = Object.entries(CATEGORIES).reduce((acc, [key, val]) => {
  acc[key] = val.icon;
  acc[val.display] = val.icon;
  return acc;
}, {} as Record<string, string>);

export const CATEGORY_ORDER = [
  "core", "ml", "dl", "rl",
  "genai", "nlp", "cv", "audio",
  "robotics", "data", "deployment",
  "apps", "ethics", "history"
];

/** Resolves a key or display name to the full display name */
export function getCategoryDisplay(input: string): string {
  if (CATEGORIES[input.toLowerCase()]) return CATEGORIES[input.toLowerCase()].display;

  // If input is already a display name (case-insensitive check)
  const found = Object.values(CATEGORIES).find(c => c.display.toLowerCase() === input.toLowerCase());
  return found ? found.display : input;
}

/** Resolves a key or display name to the icon */
export function getCategoryIcon(input: string): string {
  if (CATEGORIES[input.toLowerCase()]) return CATEGORIES[input.toLowerCase()].icon;

  const found = Object.values(CATEGORIES).find(c => c.display.toLowerCase() === input.toLowerCase());
  return found ? found.icon : (categoryIcons[input] || "📂");
}

export function sortCategories(categories: string[]) {
  // Map input categories to their keys for consistent sorting
  const toKey = (name: string) => {
    const key = Object.keys(CATEGORIES).find(k => k.toLowerCase() === name.toLowerCase() || CATEGORIES[k].display.toLowerCase() === name.toLowerCase());
    return key || name.toLowerCase();
  };

  return [...categories].sort((a, b) => {
    const keyA = toKey(a);
    const keyB = toKey(b);
    const indexA = CATEGORY_ORDER.indexOf(keyA);
    const indexB = CATEGORY_ORDER.indexOf(keyB);

    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
}
