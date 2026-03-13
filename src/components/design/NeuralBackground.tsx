import React, { useMemo, useState, useEffect } from 'react';

const NeuralBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  // Verhindert Hydration-Fehler in Astro, da Zufallszahlen auf dem Client generiert werden
  useEffect(() => {
    setMounted(true);
  }, []);

  const { nodes, edges } = useMemo(() => {
    // Parameter für das Netzwerk
    const numNodes = 60;
    const width = 400;
    const height = 1200; // Ausreichend hoch für den Viewport
    const connectionDistance = 120;

    // 1. Zufällige Knotenpunkte generieren
    const generatedNodes = Array.from({ length: numNodes }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      // 15% der Nodes sind "Highlights" (für farbliche Akzente)
      isHighlight: Math.random() > 0.85,
    }));

    // 2. Kanten (Verbindungen) zwischen nahen Knotenpunkten berechnen
    const generatedEdges = [];
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const dx = generatedNodes[i].x - generatedNodes[j].x;
        const dy = generatedNodes[i].y - generatedNodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          generatedEdges.push({
            id: `${i}-${j}`,
            x1: generatedNodes[i].x,
            y1: generatedNodes[i].y,
            x2: generatedNodes[j].x,
            y2: generatedNodes[j].y,
            // Je weiter weg, desto transparenter die Linie
            opacity: 1 - distance / connectionDistance,
          });
        }
      }
    }

    return { nodes: generatedNodes, edges: generatedEdges };
  }, []); // Wird einmalig pro Seitenaufruf generiert

  if (!mounted) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[30vw] max-w-[500px] pointer-events-none z-[0] overflow-hidden hidden xl:block">

      {/* Sanfter Glow-Hintergrund in Theme-Farben (Blau/Lila) */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" />

      {/* Die Vektorgrafik */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 1200"
        preserveAspectRatio="xMaxYMid slice"
        className="opacity-100 dark:opacity-100 transition-opacity duration-500"
      >
        {/* Linien */}
        {edges.map((edge) => (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="currentColor"
            strokeWidth="1.5"
            // Nutzt Slate-Farben deines Themes für die Standard-Verbindungen
            className="text-slate-300 dark:text-slate-700/80"
            style={{ strokeOpacity: edge.opacity * 0.8 }}
          />
        ))}

        {/* Punkte (Nodes) */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.isHighlight ? 4 : 2}
            // Highlight-Punkte in Blau, normale Punkte in Slate
            className={
              node.isHighlight
                ? "fill-blue-500 dark:fill-blue-400"
                : "fill-slate-400 dark:fill-slate-600"
            }
          />
        ))}
      </svg>

      {/* Maskierung: Lässt das Netzwerk weich nach links und unten ausblenden */}
      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-50 dark:to-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent" />
    </div>
  );
};

export default NeuralBackground;
