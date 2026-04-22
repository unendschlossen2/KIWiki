import React, { useState, useEffect } from 'react';
import InfoTooltip from '../design/InfoTooltip';

const SCENARIOS = {
  db_search: {
    label: "Szenario: Datenbank durchsuchen",
    shortDesc: "LLM fragt eine lokale SQLite-DB ab",
    steps: [
      {
        id: 0,
        title: "1. Initialization",
        desc: "LLM verbindet sich mit dem MCP Server und fragt verfügbare Tools ab.",
        llmText: "Hallo, welche Tools kannst du anbieten?",
        mcpText: "Ich habe `read_file`, `search_db` und `run_script`.",
        activeNodes: ['llm', 'mcp'],
        messageArrow: "right",
        payload: '{\n  "jsonrpc": "2.0",\n  "method": "tools/list",\n  "id": 1\n}'
      },
      {
        id: 1,
        title: "2. Planning",
        desc: "LLM entscheidet anhand der Nutzerfrage, welches Tool es nutzt.",
        llmText: "Ich muss Kundendaten nachschlagen. Ich nutze `search_db`.",
        mcpText: "Warte auf Tool-Ausführung...",
        activeNodes: ['llm'],
        messageArrow: "none",
        payload: '// LLM überlegt intern:\n// "Der User fragt nach Acme Corp.\n// Ich sollte das search_db Tool verwenden."'
      },
      {
        id: 2,
        title: "3. Execution",
        desc: "LLM sendet einen Request an den Server, um das Tool auszuführen.",
        llmText: "Führe `search_db` aus mit Query: 'Acme Corp'",
        mcpText: "Frage lokale Datenbank ab...",
        activeNodes: ['llm', 'mcp'],
        messageArrow: "right",
        payload: '{\n  "jsonrpc": "2.0",\n  "method": "tools/call",\n  "params": {\n    "name": "search_db",\n    "arguments": {\n      "query": "Acme Corp"\n    }\n  },\n  "id": 2\n}'
      },
      {
        id: 3,
        title: "4. Status Update",
        desc: "MCP Server verarbeitet die Anfrage in seiner lokalen Umgebung.",
        llmText: "Warte auf Daten...",
        mcpText: "Extrahiere Zeilen für 'Acme Corp'. 2 Einträge gefunden.",
        activeNodes: ['mcp'],
        messageArrow: "none",
        payload: "// MCP Server führt lokales Skript aus...\nSELECT * FROM employees\nWHERE company = 'Acme Corp';"
      },
      {
        id: 4,
        title: "5. Context Return",
        desc: "MCP gibt das Ergebnis zurück. Das LLM formuliert die finale Antwort.",
        llmText: "Kontext erhalten! Formuliere finale Antwort an den Nutzer.",
        mcpText: '[{ "name": "Alice", "role": "Dev" }, { "name": "Bob", "role": "Sales" }]',
        activeNodes: ['llm', 'mcp'],
        messageArrow: "left",
        payload: '{\n  "jsonrpc": "2.0",\n  "id": 2,\n  "result": {\n    "content": [\n      {\n        "type": "text",\n        "text": "[{\\"name\\":\\"Alice\\",\\"role\\":\\"Dev\\"},{\\"name\\":\\"Bob\\",\\"role\\":\\"Sales\\"}]"\n      }\n    ]\n  }\n}'
      }
    ]
  },
  read_file: {
    label: "Szenario: Lokale Datei lesen",
    shortDesc: "LLM liest und analysiert eine Log-Datei",
    steps: [
      {
        id: 0,
        title: "1. Initialization",
        desc: "LLM verbindet sich und listet verfügbare Ressourcen (Dateien/Logs) auf.",
        llmText: "Welche Ressourcen kann ich lesen?",
        mcpText: "Du kannst `config.json` und `app.log` lesen.",
        activeNodes: ['llm', 'mcp'],
        messageArrow: "right",
        payload: '{\n  "jsonrpc": "2.0",\n  "method": "resources/list",\n  "id": 1\n}'
      },
      {
        id: 1,
        title: "2. Planning",
        desc: "LLM plant, eine spezifische Datei auszulesen, um eine Frage zu klären.",
        llmText: "Ich muss die Logs prüfen. Ich fordere `app.log` an.",
        mcpText: "Warte auf Ressourcen-Anfrage...",
        activeNodes: ['llm'],
        messageArrow: "none",
        payload: '// LLM überlegt intern:\n// "Der User meldet einen Absturz.\n// Ich muss den Inhalt der Log-Datei analysieren."'
      },
      {
        id: 2,
        title: "3. Execution",
        desc: "LLM fragt den Dateiinhalt über eine spezifische URI an.",
        llmText: "Lese Ressource: `file:///logs/app.log`",
        mcpText: "Lese Datei vom Dateisystem...",
        activeNodes: ['llm', 'mcp'],
        messageArrow: "right",
        payload: '{\n  "jsonrpc": "2.0",\n  "method": "resources/read",\n  "params": {\n    "uri": "file:///logs/app.log"\n  },\n  "id": 2\n}'
      },
      {
        id: 3,
        title: "4. Status Update",
        desc: "Der MCP Server liest die Datei lokal aus.",
        llmText: "Warte auf Dateiinhalte...",
        mcpText: "Datei geladen (1.2 MB). Extrahiere Text...",
        activeNodes: ['mcp'],
        messageArrow: "none",
        payload: "// MCP Server greift auf lokales Dateisystem zu...\nfs.readFileSync('/logs/app.log', 'utf8');"
      },
      {
        id: 4,
        title: "5. Context Return",
        desc: "Der Server sendet die Dateiinhalte zurück, das LLM analysiert diese.",
        llmText: "Log erhalten! Ich sehe hier einen OutOfMemory Fehler auf Zeile 42.",
        mcpText: "[ERROR] OutOfMemory Exception in main.py...",
        activeNodes: ['llm', 'mcp'],
        messageArrow: "left",
        payload: '{\n  "jsonrpc": "2.0",\n  "id": 2,\n  "result": {\n    "contents": [\n      {\n        "uri": "file:///logs/app.log",\n        "mimeType": "text/plain",\n        "text": "[ERROR] OutOfMemory Exception..."\n      }\n    ]\n  }\n}'
      }
    ]
  },
  run_script: {
    label: "Szenario: Python Skript ausführen",
    shortDesc: "LLM führt dynamisch Code in Sandbox aus",
    steps: [
      {
        id: 0,
        title: "1. Initialization",
        desc: "LLM verbindet sich und fragt verfügbare Tools ab.",
        llmText: "Welche Tools hast du?",
        mcpText: "Ich stelle `run_script` zur Verfügung.",
        activeNodes: ['llm', 'mcp'],
        messageArrow: "right",
        payload: '{\n  "jsonrpc": "2.0",\n  "method": "tools/list",\n  "id": 1\n}'
      },
      {
        id: 1,
        title: "2. Planning",
        desc: "LLM plant, ein Skript zur Berechnung zu nutzen.",
        llmText: "Ich berechne Pi. Ich nutze `run_script`.",
        mcpText: "Warte auf Tool-Ausführung...",
        activeNodes: ['llm'],
        messageArrow: "none",
        payload: '// LLM überlegt intern:\n// "Der User fragt nach Pi.\n// Ich generiere Python-Code dafür."'
      },
      {
        id: 2,
        title: "3. Execution",
        desc: "LLM sendet Python-Code zur Ausführung.",
        llmText: "Führe `run_script` aus: `import math; print(math.pi)`",
        mcpText: "Führe Skript in Sandbox aus...",
        activeNodes: ['llm', 'mcp'],
        messageArrow: "right",
        payload: '{\n  "jsonrpc": "2.0",\n  "method": "tools/call",\n  "params": {\n    "name": "run_script",\n    "arguments": {\n      "code": "import math\\nprint(math.pi)"\n    }\n  },\n  "id": 2\n}'
      },
      {
        id: 3,
        title: "4. Status Update",
        desc: "MCP Server führt den Code sicher als Subprozess aus.",
        llmText: "Warte auf Skript-Output...",
        mcpText: "Skript beendet. Output: 3.14159...",
        activeNodes: ['mcp'],
        messageArrow: "none",
        payload: "// MCP Server führt Subprozess aus...\n$ python3 -c 'import math; print(math.pi)'\n> 3.141592653589793"
      },
      {
        id: 4,
        title: "5. Context Return",
        desc: "Server sendet Stdout zurück an das LLM.",
        llmText: "Ergebnis erhalten! Formuliere finale Antwort.",
        mcpText: "Output: 3.141592653589793",
        activeNodes: ['llm', 'mcp'],
        messageArrow: "left",
        payload: '{\n  "jsonrpc": "2.0",\n  "id": 2,\n  "result": {\n    "content": [\n      {\n        "type": "text",\n        "text": "3.141592653589793"\n      }\n    ]\n  }\n}'
      }
    ]
  }
};

type ScenarioKey = keyof typeof SCENARIOS;

export default function MCPDemo() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('db_search');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentScenario = SCENARIOS[scenarioKey];
  const STEPS = currentScenario.steps;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setStep((s) => {
          if (s >= STEPS.length - 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, STEPS.length]);

  const currentStep = STEPS[step];

  return (
    <div className="not-prose max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 font-sans my-8 overflow-hidden">
      <div className="bg-slate-800 dark:bg-slate-900 text-white px-6 py-4 border-b border-slate-700 dark:border-slate-600 flex justify-between items-center z-20 relative">
        <h3 className="flex items-center font-bold text-lg">
          Interaktive Demo: Model Context Protocol (MCP)
          <InfoTooltip position="bottom" content={<><strong>Das Konzept:</strong> MCP standardisiert die Kommunikation zwischen dem LLM und lokalen Daten/Tools. Anstatt für jeden Service Integrationen zu schreiben, verständigt sich das LLM über einen einzigen MCP-Standard.</>} />
        </h3>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="w-full md:w-1/3 p-6 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Scenario Selector */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-3">
                Szenario auswählen
              </h4>
              <div className="flex flex-col gap-3">
                {(Object.entries(SCENARIOS) as [ScenarioKey, typeof SCENARIOS[ScenarioKey]][]).map(([key, scenario]) => {
                  const isActive = scenarioKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setScenarioKey(key);
                        setStep(0);
                        setIsPlaying(false);
                      }}
                      className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden ${
                        isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-md'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                      <div className={`font-bold text-[13px] ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                        {scenario.label}
                      </div>
                      <div className={`text-xs mt-0.5 leading-tight ${isActive ? 'text-blue-600/80 dark:text-blue-400/80' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                        {scenario.shortDesc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-700"></div>

            {/* Step Information */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Aktuelle Phase</h4>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {currentStep.title}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 min-h-[60px]">
                {currentStep.desc}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col space-y-2 mt-4">
              <button
                onClick={() => {
                  if (step >= STEPS.length - 1) setStep(0);
                  setIsPlaying(!isPlaying);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors w-full"
              >
                {isPlaying ? "Pause" : (step >= STEPS.length - 1 ? "Replay" : "Play Flow")}
              </button>

              <div className="flex space-x-2">
                <button
                  disabled={step === 0}
                  onClick={() => { setStep(s => Math.max(0, s - 1)); setIsPlaying(false); }}
                  className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-sm disabled:opacity-50 transition-colors"
                >
                  Zurück
                </button>
                <button
                  disabled={step === STEPS.length - 1}
                  onClick={() => { setStep(s => Math.min(STEPS.length - 1, s + 1)); setIsPlaying(false); }}
                  className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-sm disabled:opacity-50 transition-colors"
                >
                  Weiter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (Visual Flow & Terminal) */}
        <div className="w-full md:w-2/3 flex flex-col bg-slate-100 dark:bg-slate-900">
          
          {/* Visual Graph Area */}
          <div className="p-6 pt-24 pb-8 flex flex-col items-center justify-center flex-1 relative border-b border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center w-full max-w-lg relative">

              {/* LLM Node */}
              <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-500 ${currentStep.activeNodes.includes('llm') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-blue-500/30 shadow-lg' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                <div className="text-4xl mb-2">🤖</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">LLM Client</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">(Claude/GPT)</div>

                {currentStep.activeNodes.includes('llm') && (
                  <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 w-48 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 z-10 animate-fade-in">
                    {currentStep.llmText}
                    {/* Speech bubble pointer */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-white dark:border-t-slate-800"></div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-[9px] border-transparent border-t-slate-200 dark:border-t-slate-700 -z-10"></div>
                  </div>
                )}
              </div>

              {/* Middle Arrows */}
              <div className="flex-1 flex flex-col items-center justify-center relative mx-4">
                {currentStep.messageArrow === 'right' && (
                  <div className="animate-pulse text-blue-500 font-bold text-2xl drop-shadow-md">⟶</div>
                )}
                {currentStep.messageArrow === 'left' && (
                  <div className="animate-pulse text-green-500 font-bold text-2xl drop-shadow-md">⟵</div>
                )}
                {currentStep.messageArrow === 'none' && (
                  <div className="text-slate-300 dark:text-slate-600 font-bold text-2xl">---</div>
                )}
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold text-center leading-tight">JSON-RPC<br/>/ stdio</div>
              </div>

              {/* MCP Server Node */}
              <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-500 ${currentStep.activeNodes.includes('mcp') ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-green-500/30 shadow-lg' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                <div className="text-4xl mb-2">⚙️</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">MCP Server</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">(Local Tools/DB)</div>

                {currentStep.activeNodes.includes('mcp') && (
                  <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 w-48 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 z-10 animate-fade-in">
                    {currentStep.mcpText}
                    {/* Speech bubble pointer */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-white dark:border-t-slate-800"></div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-[9px] border-transparent border-t-slate-200 dark:border-t-slate-700 -z-10"></div>
                  </div>
                )}
              </div>

            </div>

            {/* Progress Indicators */}
            <div className="flex space-x-2 mt-12">
              {STEPS.map((s, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-blue-500' : 'w-2 bg-slate-300 dark:bg-slate-600'}`}
                />
              ))}
            </div>
          </div>

          {/* Terminal / Payload Inspector */}
          <div className="p-4 bg-slate-950 h-48 overflow-hidden flex flex-col rounded-br-xl relative">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm"></span>
                MCP Protocol Payload
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-mono">JSON-RPC 2.0</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
              <pre className="text-[13px] font-mono text-emerald-400 whitespace-pre-wrap break-all leading-relaxed drop-shadow-md">
                {currentStep.payload}
                {/* Blinking Block Cursor */}
                <span className="inline-block w-2 h-4 ml-1 align-middle bg-emerald-500 animate-pulse opacity-75"></span>
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
