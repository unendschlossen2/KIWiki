// Short key -> { display name, icon, description, descriptions? }
export interface CategoryConfig {
  display: string;
  icon: string;
  description: string;
  descriptions?: {
    easy: string;
    medium: string;
    hard: string;
  };
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  core: { 
    display: "Grundlagen & Mathematische Theorie", 
    icon: "📕", 
    description: "Die mathematischen und logischen Fundamente der KI.",
    descriptions: {
      easy: "Lerne die grundlegenden Konzepte der KI kennen, ohne tief in die Mathematik einzutauchen.",
      medium: "Verstehe die logischen Strukturen und die mathematischen Prinzipien hinter modernen KI-Systemen.",
      hard: "Tauche tief in die fortgeschrittene Mathematik und Beweisführung der KI-Forschung ein."
    }
  },
  ml: { 
    display: "Klassisches Maschinelles Lernen", 
    icon: "🤖", 
    description: "Algorithmen, die aus Daten lernen, von Regression bis SVM.",
    descriptions: {
      easy: "Verstehe, wie Computer aus Beispielen lernen können, ganz ohne komplizierten Code.",
      medium: "Erforsche die Funktionsweise von Entscheidungsbäumen, Regressionen und Clustern.",
      hard: "Optimiere komplexe statistische Modelle und verstehe die mathematische Konvergenz von Algorithmen."
    }
  },
  dl: { 
    display: "Deep Learning & Neuronale Netze", 
    icon: "🧬", 
    description: "Komplexe Netzwerke, inspiriert durch das menschliche Gehirn.",
    descriptions: {
      easy: "Was sind künstliche Gehirne? Entdecke die Welt der Schichten und Neuronen auf einfache Weise.",
      medium: "Lerne, wie Backpropagation und verschiedene Netzarchitekturen wie CNNs funktionieren.",
      hard: "Konstruiere modernste Architekturen und verstehe die mathematische Dynamik in tiefen Netzen."
    }
  },
  rl: { 
    display: "Reinforcement Learning & Agenten-Systeme", 
    icon: "🎮", 
    description: "Lernen durch Interaktion, Belohnung und Bestrafung.",
    descriptions: {
      easy: "Wie Computer durch Ausprobieren lernen, wie in einem Videospiel.",
      medium: "Entdecke Q-Learning, Policies und die Balance zwischen Erkundung und Nutzung.",
      hard: "Implementiere komplexe Multi-Agenten-Systeme und berechne Bellman-Gleichungen."
    }
  },
  genai: { 
    display: "Generative KI & Foundation Models", 
    icon: "🎨", 
    description: "KI-Modelle, die Texte, Bilder und Musik selbst erschaffen.",
    descriptions: {
      easy: "Entdecke, wie KI Texte schreibt und Bilder malt – verständlich erklärt.",
      medium: "Verstehe die Transformer-Architektur und wie Modelle wie GPT trainiert werden.",
      hard: "Erforsche die Details von Diffusionsmodellen und Latent Spaces in der Tiefe."
    }
  },
  nlp: { 
    display: "Natural Language Processing (NLP)", 
    icon: "💬", 
    description: "Wie Computer unsere menschliche Sprache verstehen lernen.",
    descriptions: {
      easy: "Wie verstehen Chatbots uns eigentlich? Ein Blick auf die Grundlagen der Sprache.",
      medium: "Von Word Embeddings bis zu Tokenisierung – so wird Text für Maschinen lesbar.",
      hard: "Analysiere semantische Strukturen und entwickle komplexe Sprachverständnis-Modelle."
    }
  },
  cv: { 
    display: "Computer Vision & Bildverarbeitung", 
    icon: "👁️", 
    description: "Das Sehen und Verstehen von visuellen Inhalten durch KI.",
    descriptions: {
      easy: "Wie erkennt eine KI Gesichter auf Fotos? Das Wichtigste einfach erklärt.",
      medium: "Lerne alles über Objekterkennung, Segmentierung und Bildklassifizierung.",
      hard: "Entwickle Algorithmen für 3D-Rekonstruktion und komplexe Szenenanalyse."
    }
  },
  audio: { 
    display: "Audio-, Sprach- & Musikverarbeitung", 
    icon: "🎧", 
    description: "Analyse und Synthese von akustischen Signalen.",
    descriptions: {
      easy: "Wie Siri und Alexa uns zuhören und verstehen. Ein einfacher Einstieg.",
      medium: "Verstehe Spektrogramme, Sprachsynthese und die Magie der Musik-KI.",
      hard: "Bearbeite Audiosignale auf Wellen-Ebene und entwickle komplexe Klang-Modelle."
    }
  },
  robotics: { 
    display: "Robotik & Embodied AI", 
    icon: "🦾", 
    description: "KI in physischen Körpern, die mit der Welt interagieren.",
    descriptions: {
      easy: "Vom Staubsauger bis zum humanoiden Roboter – so bewegen sich Maschinen.",
      medium: "Erforsche Sensorik, Motorik und die Steuerung von Robotern durch KI.",
      hard: "Kontrolliere hochkomplexe physische Systeme mit RL und Computer Vision."
    }
  },
  data: { 
    display: "Daten, Datensätze & Infrastruktur", 
    icon: "📊", 
    description: "Das Fundament: Wie Daten gesammelt und verarbeitet werden.",
    descriptions: {
      easy: "Warum Daten so wichtig für KI sind und wie sie sortiert werden.",
      medium: "Datenreinigung, Feature Engineering und der Aufbau von Pipelines.",
      hard: "Optimiere massive Datenbanken und skaliere die Infrastruktur für Big Data."
    }
  },
  deployment: { 
    display: "MLOps, Engineering & Hardware", 
    icon: "🏗️", 
    description: "KI in die Produktion bringen und effizient betreiben.",
    descriptions: {
      easy: "Wie ein fertiges KI-Modell den Weg auf dein Smartphone findet.",
      medium: "Containerisierung, Monitoring und die Welt der Edge-Devices.",
      hard: "Architekturen für verteilte Systeme und Optimierung für spezialisierte Hardware."
    }
  },
  apps: { 
    display: "Branchen & Praktische Anwendungen", 
    icon: "🚀", 
    description: "Wie KI die Medizin, Industrie und den Alltag verändert.",
    descriptions: {
      easy: "Wo begegnet uns KI heute schon im Alltag? Spannende Anwendungsbeispiele.",
      medium: "KI in der Diagnose, autonomen Fahren und industriellen Optimierung.",
      hard: "Entwickle branchenspezifische Lösungen mit höchster Präzision und Effizienz."
    }
  },
  ethics: { 
    display: "Ethik, Sicherheit & KI-Alignment", 
    icon: "⚖️", 
    description: "Verantwortungsvoller Umgang und Sicherheit von KI-Systemen.",
    descriptions: {
      easy: "Darf eine KI alles? Ein Überblick über Fairness und Verantwortung.",
      medium: "Bias in Daten, Erklärbarkeit von KI und regulatorische Rahmenbedingungen.",
      hard: "Sichere superintelligente Systeme ab und erforsche die Theorie des Alignments."
    }
  },
  history: { 
    display: "Geschichte, Akteure & Organisationen", 
    icon: "📜", 
    description: "Die Meilensteine und Pioniere der KI-Entwicklung.",
    descriptions: {
      easy: "Die spannende Reise der KI: Von den ersten Ideen bis heute.",
      medium: "Lerne die wichtigsten Akteure wie OpenAI, Google und die Pioniere kennen.",
      hard: "Analysiere die Evolution von Forschungsparadigmen über Jahrzehnte hinweg."
    }
  }
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
