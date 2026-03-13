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
> 
> ### Schritt 3: Verfügbare Kategorien (Keys)
> 
> Um das Schreiben zu erleichtern, kannst du kurze Keys im Frontmatter nutzen. Das System ordnet sie automatisch dem richtigen Namen und Icon zu:
> 
> | Key | Anzeige-Name | Icon |
> | :--- | :--- | :--- |
> | `core` | Grundlagen & Mathematische Theorie | 📕 |
> | `ml` | Klassisches Maschinelles Lernen (ML) | 🤖 |
> | `dl` | Deep Learning & Neuronale Netze | 🧬 |
> | `genai` | Generative KI & Foundation Models | 🎨 |
> | `nlp` | Natural Language Processing (NLP) | 💬 |
> | `cv` | Computer Vision & Bildverarbeitung | 👁️ |
> | `robotics` | Robotik & Embodied AI | 🦾 |
> | `data` | Daten, Datensätze & Infrastruktur | 📊 |
> | `deployment` | MLOps, Engineering & Hardware | 🏗️ |
> | `ethics` | Ethik, Sicherheit & KI-Alignment | ⚖️ |
> | `history` | Geschichte, Akteure & Organisationen | 📜 |
> | `allgemein` | Allgemein | 📦 |
> 
> ### Schritt 3: Tags (Optional)
> 
> Tags erlauben es, Artikel über Kategorien hinweg zu verknüpfen. Im Gegensatz zu Kategorien kann ein Artikel **beliebig viele** Tags haben. Sie erscheinen als Badges am Anfang des Artikels und in einem eigenen Dropdown in der Navigation.
> 
> ### Schritt 4: Aliases (Optional für die Suche)
> 
> Aliases sind alternative Namen oder Schreibweisen für denselben Artikel (z.B. "Transformer" -> `["Transformers", "LLM"]`). 
> 
> *   **Zweck**: Sie helfen dabei, den Artikel über die Suchfunktion zu finden, auch wenn der Nutzer nicht den exakten Titel eingibt.
> *   **Unterschied zu Tags**: Aliases sind **unsichtbar** (nur für die Suche), während Tags **sichtbar** sind und zur Navigation dienen.
> 
### Schritt 5: Kategorien verwalten
> 
> Kategorien, Icons und die Sortierung werden zentral in `src/config/categories.ts` verwaltet.
> 
> Um eine neue Kategorie hinzuzufügen oder ein Icon zu ändern, bearbeite `CATEGORIES` in `src/config/categories.ts`:
> 
> ```typescript
> export const CATEGORIES: Record<string, { display: string; icon: string }> = {
>   ml: {
>     display: "Machine Learning",
>     icon: "🤖"
>   },
>   // ...
> };
> ```

### Schritt 3: Ordnerstruktur (Optional)

Du kannst Artikel in Unterordnern organisieren, um die Übersicht zu behalten. Das System unterstützt beliebig tiefe Verschachtelungen:

`src/content/articles/1. Grundlagen & Theorie/was-ist-ki.mdx`  
→ URL: `/KIWiki/articles/1.-grundlagen-&-theorie/was-ist-ki`

### Schritt 3: Inhalt verfassen

Danach schreibst du ganz normales Markdown. Keine Imports nötig!

```mdx
---
title: "Backpropagation"
description: "Wie neuronale Netze lernen."
---

Backpropagation ist der Algorithmus, mit dem neuronale Netze trainiert werden.

## Grundidee

:::beginner
Stell dir vor, du hast ein falsches Ergebnis. Backpropagation sagt jedem
Knoten im Netz, wie sehr er schuld ist, damit er sich verbessern kann.
:::

:::medium
Der Gradient der Verlustfunktion wird schichtweise rückwärts durch das Netz
propagiert. Jede Gewichtung wird proportional zu ihrem Beitrag zum Fehler
angepasst.
:::

:::advanced
Formal berechnet die Backpropagation $\frac{\partial \loss}{\partial w_{ij}}$
Fortgeschrittens der Kettenregel. Für eine Schicht $l$ gilt:

$$\delta^{(l)} = (W^{(l+1)})^T \delta^{(l+1)} \circ \sigmoid'(z^{(l)})$$
:::

## Beispiel

<InfoBox type="info" title="Tipp">
  Visualisiere den Gradienten als Fluss von Fehlersignalen.
</InfoBox>
```

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

### Inhalt ohne Direktive

Text **außerhalb** einer `:::` Direktive wird bei **allen** Stufen angezeigt.

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

> **Standard:** Wenn `difficulties` weggelassen wird, ist der Artikel 
> bei **allen** Stufen sichtbar.

In der Seitenleiste werden Artikel mit eingeschränkter Sichtbarkeit 
mit farbigen Badges markiert (E = Einsteiger, M = Fortgeschritten, X = Experte).

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

### DifficultySelector

```mdx
<DifficultySelector client:load />
```

> Normalerweise nicht nötig, da der Selector bereits in der Navigationsleiste ist.

### ActivationDemo

```mdx
<ActivationDemo client:load />
```

> Interaktive Demo für Aktivierungsfunktionen.

### Wichtig: `client:load`

Interaktive Komponenten (React) brauchen immer `client:load`, damit sie 
im Browser funktionieren.

---

## 6. Mathematik mit KaTeX

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

In `src/config/katex-macros.js` sind häufig verwendete Abkürzungen definiert:

| Makro       | Ergebnis          | Bedeutung                    |
|-------------|-------------------|------------------------------|
| `\R`        | ℝ                 | Reelle Zahlen                |
| `\N`        | ℕ                 | Natürliche Zahlen            |
| `\loss`     | ℒ                 | Verlustfunktion              |
| `\grad`     | ∇                 | Gradient (Nabla)             |
| `\sigmoid`  | σ                 | Sigmoid-Funktion             |
| `\softmax`  | softmax           | Softmax-Funktion             |
| `\relu`     | ReLU              | Rectified Linear Unit        |
| `\argmax`   | argmax            | Argument des Maximums        |
| `\argmin`   | argmin            | Argument des Minimums        |
| `\xvec`     | **x**             | Eingabevektor                |
| `\wvec`     | **w**             | Gewichtsvektor               |
| `\bvec`     | **b**             | Bias-Vektor                  |

Neue Makros können in `katex-macros.js` hinzugefügt werden.

---

## 7. Checkliste für neue Artikel

- [ ] Datei in `src/content/articles/` erstellt (`.mdx`)
- [ ] `title` im Frontmatter gesetzt
- [ ] Optional: `description` hinzugefügt
- [ ] `category` im Frontmatter gesetzt (und ggf. Icon in `categories.ts` definiert)
- [ ] Optional: `tags` für die Navigation hinzugefügt
- [ ] Optional: `aliases` für eine bessere Suche hinzugefügt
- [ ] Optional: `difficulties` eingeschränkt (wenn nicht für alle Stufen)
- [ ] Inhalt mit `:::beginner`, `:::medium`, `:::advanced` strukturiert
- [ ] Mathe-Formeln mit `$...$` oder `$$...$$` geschrieben
- [ ] `npm run build` läuft ohne Fehler
- [ ] Artikel erscheint in der Seitenleiste

---

## 8. Häufige Fehler

| Problem | Lösung |
|---------|--------|
| Artikel erscheint nicht | Prüfe, ob die Datei in `src/content/articles/` liegt |
| Komponente nicht gefunden | Stelle sicher, dass `client:load` verwendet wird |
| Build-Fehler im Frontmatter | Prüfe das Schema in `src/content/config.ts` |
| Mathe wird nicht gerendert | Verwende `$...$` für Inline und `$$...$$` für Blöcke |
| `:::` Block funktioniert nicht | Achte auf Leerzeilen vor und nach `:::` Blöcken |

---

## 9. Vorlage (Template) nutzen

Um dir den Start zu erleichtern, haben wir eine Vorlage unter `src/content/articles/_template.mdx` angelegt. Du kannst sie Einsteiger kopieren und als Basis für deinen neuen Artikel nutzen.
