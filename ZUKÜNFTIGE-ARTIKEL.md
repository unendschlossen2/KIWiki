# Fahrplan: Zukünftige Artikel & Demo-Konzepte

Dieses Dokument listet geplante Artikel für das KIWiki auf. Die Struktur folgt den Best-Practices für Einsteiger, Fortgeschrittene und Experten.

---

## 1. Linear Regression (Lineare Regression)
**Fokus:** Das Fundament der prädiktiven Modellierung — Trends in Daten finden.

*   **Kategorie:** `ml` (Klassisches Maschinelles Lernen)
*   **Keywords:** `Regression`, `OLS`, `Kleinste Quadrate`, `Gradient Descent`, `Bias-Variance`
*   **Struktur:** Grundkonzept der Ausgleichsgeraden, Kostenfunktion (MSE), Optimierung.
*   **Demo-Idee:** Ein Streudiagramm, in dem der User Datenpunkte setzt und eine Gerade interaktiv "fittet" (manuell oder per Knopfdruck via Gradient Descent).
*   **Abhängigkeiten:** Mathematische Grundlagen (Vektoren/Ableitungen).

---

## 2. Logistic Regression (Logistische Regression)
**Fokus:** Der Einstieg in die Klassifikation — Wahrscheinlichkeiten für binäre Entscheidungen.

*   **Kategorie:** `ml`
*   **Keywords:** `Klassifikation`, `Sigmoid`, `Log-Loss`, `Binäre Entscheidung`
*   **Struktur:** Unterschied zur linearen Regression, die Sigmoid-Funktion, Entscheidungsgrenzen.
*   **Demo-Idee:** Eine interaktive Sigmoid-Kurve, bei der man die Steigung und Verschiebung anpasst, um Datenpunkte in zwei Klassen zu trennen.
*   **Abhängigkeiten:** Linear Regression (für das Verständnis der Linearkombination).

---

## 3. Decision Trees (Entscheidungsbäume)
**Fokus:** Intuitive, baumartige Entscheidungsstrukturen.

*   **Kategorie:** `ml`
*   **Keywords:** `Entscheidungsbaum`, `Gini-Index`, `Information Gain`, `Overfitting`, `Pruning`
*   **Struktur:** Wurzelknoten, Splits, Blattknoten. Wie ein Baum "entscheidet".
*   **Demo-Idee:** Ein interaktiver Baum-Editor, der zeigt, wie sich die Datenverteilung bei jedem "Split" in einem 2D-Koordinatensystem verändert.
*   **Unter-Artikel:** "Entropy & Gini-Index im Detail", "Visualisierung von Baumstrukturen".

---

## 4. Random Forests
**Fokus:** Die Macht der Menge — Viele Bäume für stabilere Vorhersagen.

*   **Kategorie:** `ml`
*   **Keywords:** `Ensemble Learning`, `Bagging`, `Bootstrap`, `Feature Importance`
*   **Struktur:** Das Prinzip von Bagging, Reduktion von Varianz, Abstimmung der Bäume.
*   **Demo-Idee:** Visualisierung von 5-10 kleinen Bäumen gleichzeitig. Man sieht, wie die "Mehrheitsentscheidung" (Voting) das Endergebnis robuster macht als ein einzelner Baum.
*   **Abhängigkeiten:** Decision Trees.

---

## 5. Gradient Boosting (XGBoost, LightGBM)
**Fokus:** Fehler korrigieren — Sequentielles Lernen für Höchstleistung.

*   **Kategorie:** `ml`
*   **Keywords:** `Boosting`, `AdaBoost`, `XGBoost`, `Residuen`, `Lernrate`
*   **Struktur:** Das Prinzip von Boosting (aus Fehlern lernen), Residuen-Fitting, Unterschied zu Bagging.
*   **Demo-Idee:** Ein schrittweiser Prozess, der zeigt, wie ein Modell ein einfaches Signal lernt, der nächste Baum die Fehler (Residuen) lernt und die Summe immer präziser wird.
*   **Abhängigkeiten:** Decision Trees.

---

## 6. Support Vector Machines (SVM)
**Fokus:** Grenzen ziehen — Der "Maximum Margin" Klassifikator.

*   **Kategorie:** `ml`
*   **Keywords:** `SVM`, `Hyperplane`, `Kernel-Trick`, `Support Vectors`, `Margin`
*   **Struktur:** Lineare Trennbarkeit, Margin-Maximierung, der Kernel-Trick für nicht-lineare Daten.
*   **Demo-Idee:** Ein 2D-Raum mit zwei Klassen. Der User verschiebt die Punkte und sieht, wie sich die "Hard/Soft-Margin" und die Trennebene dynamisch anpassen.
*   **Unter-Artikel:** "Der Kernel-Trick (Mathematik)", "Lagrange-Multiplikatoren in SVMs".

---

## 7. Naive Bayes
**Fokus:** Wahrscheinlichkeitsrechnung in Aktion — Der Klassiker für Text-Filter.

*   **Kategorie:** `ml`
*   **Keywords:** `Bayes Theorem`, `Bedingte Wahrscheinlichkeit`, `Spam-Filter`, `Prior/Posterior`
*   **Struktur:** Satz von Bayes, die "naive" Annahme der Unabhängigkeit, Anwendung in der Textklassifikation.
*   **Demo-Idee:** Ein einfacher Spam-Filter-Simulator. Der User gibt Wörter ein und sieht, wie sich die Wahrscheinlichkeiten für "Spam" vs. "Ham" basierend auf Worthäufigkeiten verschieben.
*   **Abhängigkeiten:** Grundlagen der Wahrscheinlichkeitsrechnung.

---

## 8. K-Nearest Neighbors (k-NN)
**Fokus:** Sag mir, wer deine Nachbarn sind — Klassifikation durch Nähe.

*   **Kategorie:** `ml`
*   **Keywords:** `k-NN`, `Euklidische Distanz`, `Lazy Learning`, `Fluch der Dimensionalität`
*   **Struktur:** Distanzmetriken, Wahl von 'k', Vor- und Nachteile (keine Trainingsphase).
*   **Demo-Idee:** Ein interaktives Koordinatensystem. Man setzt einen neuen Punkt und sieht, wie das Modell die 'k' nächsten Nachbarn einkreist und die Klasse bestimmt.

---

## 9. K-Means Clustering
**Fokus:** Muster ohne Label finden — Automatisches Gruppieren von Daten.

*   **Kategorie:** `ml`
*   **Keywords:** `Unsupervised Learning`, `Clustering`, `Centroids`, `Elbow Method`
*   **Struktur:** Initialisierung, Zuweisung, Update der Centroiden. Wann bricht man ab?
*   **Demo-Idee:** Eine Animation des K-Means-Algorithmus. Man sieht, wie die Centroiden in jedem Schritt "wandern", bis die Cluster stabil sind.

---

## 10. Principal Component Analysis (PCA)
**Fokus:** Den Kern finden — Dimensionsreduktion ohne Informationsverlust.

*   **Kategorie:** `ml` (bzw. `data`)
*   **Keywords:** `PCA`, `Eigenwerte`, `Eigenvektoren`, `Varianz`, `Dimensionsreduktion`
*   **Struktur:** Projektion von Daten, Hauptkomponenten, Datenkompression und Visualisierung.
*   **Demo-Idee:** Eine 3D-Punktwolke, die auf eine 2D-Ebene projiziert wird. Der User kann die Ebene drehen, um die Projektion mit der höchsten Varianz zu finden.
*   **Abhängigkeiten:** Lineare Algebra (Matrizen, Eigenwerte).

---

## 11. Neural Networks (Neuronale Netze)
**Fokus:** Vom biologischen Vorbild zu tiefen Architekturen.

*   **Status:** *Teilweise abgedeckt durch den Artikel "Neuron".*
*   **Kategorie:** `dl` (Deep Learning)
*   **Keywords:** `MLP`, `Backpropagation`, `Hidden Layers`, `Universal Approximation`
*   **Struktur:** Schichten-Architektur, der Vorwärtspass, Backpropagation-Algorithmus (Kettenregel).
*   **Unter-Artikel:** "Backpropagation im Detail", "Aktivierungsfunktionen (Deep Dive)", "Optimierer (Adam, SGD)".
*   **Abhängigkeiten:** Neuron.

---

## 12. Transformers
**Fokus:** Revolution der Sprachverarbeitung — Self-Attention und Parallelisierung.

*   **Status:** *Artikel existiert bereits.*
*   **Kategorie:** `genai` / `nlp`
*   **Keywords:** `Self-Attention`, `Encoder-Decoder`, `Positional Encoding`, `GPT`, `BERT`
*   **Struktur:** Architektur (Vaswani et al.), Multi-Head Attention, Skalierbarkeit.
*   **Unter-Artikel:** "Attention Is All You Need — Paper Review", "BERT vs GPT Architekturen".
*   **Abhängigkeiten:** Neural Networks, Word Embeddings.
