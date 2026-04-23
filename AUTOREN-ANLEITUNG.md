# AUTOREN-ANLEITUNG — KIWiki

Dieses Dokument erklärt, wie man neue Artikel für das KIWiki erstellt und pflegt.

---

## 1. Projektstruktur

```
src/
├── content/
│   ├── config.ts          ← Zod-Schema (Frontmatter-Validierung)
│   └── articles/          ← HIER neue Artikel anlegen
│       └── neuron.mdx     ← Beispielartikel
├── components/            ← React- und Astro-Komponenten
├── config/
│   └── katex-macros.js    ← Zentrale Mathe-Makros
├── layouts/
│   └── Layout.astro       ← Haupt-Layout (Navbar, Sidebar, ToC)
└── pages/
    ├── index.astro        ← Die neue Startseite mit Kategorien
    ├── ueber.mdx          ← "Über das Projekt" Seite
    └── articles/
        └── [...slug].astro ← Dynamische Route für alle Artikel

scripts/
└── generate-index.js   ← Generiert den Artikel-Index für die KI

ARTICLE_INDEX.json       ← Statischer Artikel-Index (automatisch generiert)
```

---

## 2. Neuen Artikel erstellen

### Schritt 1: Datei anlegen

Erstelle eine neue `.mdx`-Datei in `src/content/articles/`:

```
src/content/articles/mein-neuer-artikel.mdx
```

> **Wichtig:** Der Dateiname (ohne `.mdx`) wird zur URL.  
> `mein-neuer-artikel.mdx` → `/KIWiki/articles/mein-neuer-artikel`

> **Tipp:** Wenn du einen Dateinamen mit einem Unterstrich beginnst (z.B. `_entwurf.mdx`), wird dieser Artikel **nicht** in der Seitenleiste angezeigt. Dies ist nützlich für Entwürfe.

### Schritt 2: Frontmatter schreiben

Jeder Artikel **muss** einen Frontmatter-Block haben. Neu ist das Feld `category`, um Artikel in der Seitenleiste zu gruppieren:

```yaml
---
title: "Mein Artikel-Titel"
description: "Kurze Beschreibung (optional)"
category: "ml" # Kurze Keys (ml, dl, genai, etc.) oder voller Name
tags: ["Deep Learning", "Attention"] # Optionale Tags für quergelagerte Themen
---
```

> **Hinweis:** Wenn kein `category` angegeben wird, erscheint der Artikel unter "Allgemein".

### Schritt 3: Verfügbare Kategorien (Keys)

Um das Schreiben zu erleichtern, kannst du kurze Keys im Frontmatter nutzen. Das System ordnet sie automatisch dem richtigen Namen und Icon zu:

| Key | Anzeige-Name | Icon |
| :--- | :--- | :--- |
| `core` | Grundlagen & Mathematische Theorie | 📕 |
| `ml` | Klassisches Maschinelles Lernen (ML) | 🤖 |
| `dl` | Deep Learning & Neuronale Netze | 🧬 |
| `genai` | Generative KI & Foundation Models | 🎨 |
| `nlp` | Natural Language Processing (NLP) | 💬 |
| `cv` | Computer Vision & Bildverarbeitung | 👁️ |
| `robotics` | Robotik & Embodied AI | 🦾 |
| `data` | Daten, Datensätze & Infrastruktur | 📊 |
| `deployment` | MLOps, Engineering & Hardware | 🏗️ |
| `ethics` | Ethik, Sicherheit & KI-Alignment | ⚖️ |
| `history` | Geschichte, Akteure & Organisationen | 📜 |
| `allgemein` | Allgemein | 📦 |

### Schritt 4: Tags (Optional)

Tags erlauben es, Artikel über Kategorien hinweg zu verknüpfen. Im Gegensatz zu Kategorien kann ein Artikel **beliebig viele** Tags haben. Sie erscheinen als Badges am Anfang des Artikels und in einem eigenen Dropdown in der Navigation.

### Schritt 5: Aliases (Optional für die Suche)

Aliases sind alternative Namen oder Schreibweisen für denselben Artikel (z.B. "Transformer" -> `["Transformers", "LLM"]`). 

*   **Zweck**: Sie helfen dabei, den Artikel über die Suchfunktion zu finden, auch wenn der Nutzer nicht den exakten Titel eingibt.
*   **Unterschied zu Tags**: Aliases sind **unsichtbar** (nur für die Suche), während Tags **sichtbar** sind und zur Navigation dienen.

---

## 3. Schwierigkeitsstufen (Directives)

Das Wiki hat drei Schwierigkeitsstufen: **Einsteiger**, **Fortgeschritten**, **Experte**.

### Syntax

Verwende die `:::` Direktiven-Syntax:

```mdx
:::beginner
Text nur für die Stufe "Einsteiger".
:::

:::medium
Text nur für die Stufe "Fortgeschritten".
:::

:::advanced
Text nur für die Stufe "Experte".
:::
```

### Erlaubte Schlüsselwörter

| Schlüsselwort    | Stufe    |
|------------------|----------|
| `:::beginner`    | Einsteiger  |
| `:::easy`        | Einsteiger  |
| `:::medium`      | Fortgeschritten   |
| `:::intermediate`| Fortgeschritten   |
| `:::advanced`    | Experte  |
| `:::hard`        | Experte  |

---

## 4. Artikel nur für bestimmte Stufen

Wenn ein ganzer Artikel nur für bestimmte Schwierigkeitsstufen sichtbar sein soll, 
füge das `difficulties`-Feld im Frontmatter hinzu:

```yaml
---
title: "Transformer-Architektur"
description: "Tiefe Analyse der Attention-Mechanismen."
difficulties:
  - medium
  - hard
---
```

Erlaubte Werte: `easy`, `medium`, `hard`.

---

## 5. Verfügbare Komponenten (kein Import nötig!)

Alle folgenden Komponenten sind automatisch in jeder `.mdx`-Datei verfügbar:

### InfoBox

```mdx
<InfoBox type="info" title="Hinweis">
  Hier steht ein informativer Text.
</InfoBox>
```

Typen: `info`, `warning`, `success`, `danger`, `note`

### Interaktive Demos (Beispiele)

```mdx
<CNNDemo client:load />
<ActivationDemo client:load />
<TransformerDemo client:load />
```

> **Wichtig:** Interaktive Komponenten (React) brauchen immer `client:load`.

---

## 6. Interaktive Komponenten registrieren

Falls du eine **neue** React-Komponente (Demo) erstellt hast, musst du sie in `astro.config.mjs` registrieren, damit sie in MDX-Dateien ohne Import-Statement verfügbar ist:

```javascript
// astro.config.mjs
[remarkComponentAutoImport, {
  // ...
  MeineNeueDemo: comp('demos/MeineNeueDemo.tsx'),
}]
```

---

## 7. Automatische Index-Aktualisierung

Du musst dich nicht mehr manuell um den Suchindex kümmern! Das Wiki verfügt über eine Integration, die den Index (`ARTICLE_INDEX.json`) automatisch aktualisiert, wenn:
- Du den Entwicklungs-Server startest (`npm run dev`).
- Du einen Artikel speicherst (der Index wird im Hintergrund neu generiert).
- Die Seite für die Produktion gebaut wird (`npm run build`).

---

## 8. Mathematik mit KaTeX

### Inline-Mathe

```mdx
Die Ausgabe ist $\sigmoid(z)$ wobei $z = \wvec^T \xvec + b$.
```

### Block-Mathe

```mdx
$$
\loss = -\frac{1}{N} \sum_{i=1}^{N} y_i \log(\hat{y}_i)
$$
```

### Zentrale Makros

In `src/config/katex-macros.js` sind häufig verwendete Abkürzungen definiert: `\R`, `\N`, `\loss`, `\grad`, `\sigmoid`, `\softmax`, `\relu`, `\xvec`, `\wvec`, `\bvec`.

---

## 9. Best Practices & Formatierungs-Richtlinien

### 9.1 Interaktive Demos richtig einbinden
* **Einheitliche Überschrift:** Jede interaktive Komponente MUSS unter einer expliziten Markdown-Überschrift stehen: `## Interaktive Demo`.
* **Keine InfoBoxen als Wrapper:** Packe Demos **nicht** in eine `<InfoBox>`.

### 9.2 MDX Parsing-Fallen (Python & f-Strings)
* **Das Problem:** Der MDX-Parser interpretiert geschweifte Klammern `{...}` als JSX-Ausdrücke.
* **Die Lösung:** Vermeide Python f-Strings (z. B. `f"Hallo {name}"`) in Code-Beispielen. Nutze stattdessen `"Hallo " + name` oder `"Hallo %s" % name`.

### 9.3 Strukturierung & InfoBoxen
* **Haupttext:** Kerninhalt gehört direkt als Fließtext in die Datei, gegliedert durch `:::beginner`, `:::medium`, `:::advanced`.
* **InfoBoxen:** Nur für ergänzende Hinweise (Tipp, Note, Warning).

---

## 10. Checkliste für neue Artikel

- [ ] Datei in `src/content/articles/` erstellt (`.mdx`)
- [ ] `title` und `category` im Frontmatter gesetzt
- [ ] Inhalt mit `:::beginner`, `:::medium`, `:::advanced` strukturiert
- [ ] Mathe-Formeln mit `$...$` oder `$$...$$` geschrieben
- [ ] Bei Demos: `## Interaktive Demo` als Headline gesetzt
- [ ] Keine f-Strings in Python-Code-Blöcken verwendet
- [ ] `npm run build` läuft ohne Fehler

---

## 11. Vorlage (Template) nutzen

Kopiere `src/content/articles/_template.mdx` als Basis für deinen neuen Artikel.
