import React, { useState, useEffect } from 'react';
import InfoTooltip from '../design/InfoTooltip';

const STEPS = [
  {
    id: 0,
    title: "1. Initialization",
    desc: "LLM connects to the MCP server and discovers available tools.",
    llmText: "Hello, what tools can you provide?",
    mcpText: "I have `read_file`, `search_db`, and `run_script`.",
    activeNodes: ['llm', 'mcp'],
    messageArrow: "right"
  },
  {
    id: 1,
    title: "2. Planning",
    desc: "LLM decides which tool to use based on the user prompt.",
    llmText: "I need to look up client data. I'll invoke `search_db`.",
    mcpText: "Waiting for tool execution...",
    activeNodes: ['llm'],
    messageArrow: "none"
  },
  {
    id: 2,
    title: "3. Execution",
    desc: "LLM sends a request to the MCP Server to execute the tool.",
    llmText: "Call `search_db` with query: 'Acme Corp'",
    mcpText: "Querying internal database...",
    activeNodes: ['llm', 'mcp'],
    messageArrow: "right"
  },
  {
    id: 3,
    title: "4. Status Update",
    desc: "MCP Server processes the tool request in its local environment.",
    llmText: "Waiting for data...",
    mcpText: "Extracting rows for 'Acme Corp'. Found 3 records.",
    activeNodes: ['mcp'],
    messageArrow: "none"
  },
  {
    id: 4,
    title: "5. Context Return",
    desc: "MCP returns the context to the LLM, which formats the final answer.",
    llmText: "Got context! Formulating final response to user.",
    mcpText: "Here are the records: [...Data...]",
    activeNodes: ['llm', 'mcp'],
    messageArrow: "left"
  }
];

export default function MCPDemo() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentStep = STEPS[step];

  return (
    <div className="not-prose max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 font-sans my-8">
      <div className="bg-slate-800 dark:bg-slate-900 text-white px-6 py-4 rounded-t-xl border-b border-slate-700 dark:border-slate-600 flex justify-between items-center z-20 relative">
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
        <div className="w-full md:w-1/3 p-6 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col justify-between md:rounded-bl-xl">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Phase</h4>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {currentStep.title}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 min-h-[60px]">
                {currentStep.desc}
              </p>
            </div>

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

        {/* Right Panel (Visual Flow) */}
        <div className="w-full md:w-2/3 p-6 flex flex-col items-center justify-center min-h-[300px] relative bg-slate-100 dark:bg-slate-900 md:rounded-br-xl">
          <div className="flex justify-between items-center w-full max-w-lg mb-8 relative">

            {/* LLM Node */}
            <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${currentStep.activeNodes.includes('llm') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
              <div className="text-4xl mb-2">🤖</div>
              <div className="font-bold text-slate-800 dark:text-slate-200">LLM Client</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">(Claude/GPT)</div>

              {currentStep.activeNodes.includes('llm') && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-48 bg-white dark:bg-slate-800 p-2 rounded shadow-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  {currentStep.llmText}
                </div>
              )}
            </div>

            {/* Middle Arrows */}
            <div className="flex-1 flex flex-col items-center justify-center relative mx-4">
              {currentStep.messageArrow === 'right' && (
                <div className="animate-pulse text-blue-500 font-bold text-2xl">⟶</div>
              )}
              {currentStep.messageArrow === 'left' && (
                <div className="animate-pulse text-green-500 font-bold text-2xl">⟵</div>
              )}
              {currentStep.messageArrow === 'none' && (
                <div className="text-slate-300 dark:text-slate-600 font-bold text-2xl">---</div>
              )}
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">JSON-RPC / stdio</div>
            </div>

            {/* MCP Server Node */}
            <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${currentStep.activeNodes.includes('mcp') ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
              <div className="text-4xl mb-2">⚙️</div>
              <div className="font-bold text-slate-800 dark:text-slate-200">MCP Server</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">(Local Tools/DB)</div>

              {currentStep.activeNodes.includes('mcp') && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-48 bg-white dark:bg-slate-800 p-2 rounded shadow-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  {currentStep.mcpText}
                </div>
              )}
            </div>

          </div>

          {/* Progress Indicators */}
          <div className="flex space-x-2 mt-8">
            {STEPS.map((s, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-blue-500' : 'w-2 bg-slate-300 dark:bg-slate-600'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
