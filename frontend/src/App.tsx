import { useState, useEffect, useRef, useCallback } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<{role:string;content:string;evidence:any[];disclosure:string}[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [conversationId] = useState(() => "ghost-" + Math.random().toString(36).slice(2));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("http://127.0.0.1:8002/health");
        if (res.ok) {
          const data = await res.json();
          setBackendStatus(`Backend OK (port 8002) · ollama: ${data.ollama}`);
          setConnected(true);
        } else {
          setBackendStatus(`Backend unreachable (port 8002)`);
          setConnected(false);
        }
      } catch {
        setBackendStatus("Backend unreachable (port 8002) — check server running");
        setConnected(false);
      }
    }
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || generating) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg, evidence: [], disclosure: '' }]);
    setInput("");
    setGenerating(true);
    try {
      const res = await fetch("http://127.0.0.1:8002/ghost/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, conversation_id: conversationId }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || "No response received.", evidence: data.references || [], disclosure: data.synthetic_disclosure || "" }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection failed — check backend on port 8002.", evidence: [], disclosure: "" }]);
    } finally {
      setGenerating(false);
    }
  }, [input, generating, conversationId]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#020617] text-[#f3f0e8]">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[120%] h-[120%] pointer-events-none opacity-40">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-200/10 via-rose-200/10 to-slate-400/10 blur-3xl" />
        </div>
        <h1 className="relative z-10 text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9] text-[#f3f0e8]">
          Tomorrow's Ghost
        </h1>
        <p className="relative z-10 mt-5 text-xl md:text-2xl font-light tracking-wide text-[#e0ddd6]">
          Meet the Person You Used to Be
        </p>
        <p className="relative z-10 mt-3 max-w-xl text-[#b0a898] text-sm md:text-base leading-relaxed">
          A cinematic, local-first journey through your synthetic historical memories,
          guided by open-weight AI. Evidence-grounded, private, and hauntingly personal.
        </p>

        <div className="relative z-10 mt-10 flex flex-wrap gap-4 justify-center">
          <a
            href="#chamber"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 bg-slate-100/10 text-slate-100 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 shadow-lg shadow-black/20"
          >
            <span>Enter the Ghost Chamber</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* Status Bar */}
      <section id="status" className="max-w-2xl mx-auto px-6 mb-16">
        <div className={`panel-glass rounded-2xl p-6 shadow-xl shadow-black/30 ${connected ? "border-emerald-400/20" : "border-rose-400/20"}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${connected ? "bg-emerald-400" : "bg-rose-400"}`} />
            <span className="text-xs uppercase tracking-widest text-[#b8b4a8] font-semibold">Local Services</span>
          </div>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">{backendStatus}</p>
          <p className="text-xs text-slate-500 mt-2">Frontend: localhost:5174 · Backend: localhost:8002 · Ollama: localhost:11434</p>
        </div>
      </section>

      {/* Ghost Chamber — Evidence-grounded AI experience */}
      <section id="chamber" className="max-w-3xl mx-auto px-6 mb-24">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-glow mb-4">The Ghost Chamber</h2>
        <p className="text-center text-[#b0a898] mb-10">Evidence-grounded reflection powered by local AI.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="panel-glass rounded-2xl p-7 shadow-xl shadow-black/20">
            <h3 className="text-lg font-bold text-[#f5d89a] mb-2">Synthetic Historical Memory</h3>
            <p className="text-sm text-[#e0ddd6] leading-relaxed mb-4">
              A fabricated journal entry from 2016 — a letter to a future self — preserved in synthetic fixtures.
            </p>
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4 text-xs md:text-sm text-[#c5c0b5] leading-loose font-mono">
              "In 2016 I believed the future would hold certainty. I thought technology would solve loneliness. I wrote these words hoping to find clarity — and instead I found more questions."
            </div>
            <p className="text-xs text-slate-500 mt-3">Source: synthetic/fixture_memory_2016.md · Evidence citation: required for AI responses</p>
          </div>

          <div className="panel-glass rounded-2xl p-7 shadow-xl shadow-black/20">
            <h3 className="text-lg font-bold text-[#f5b0a0] mb-2">Past vs. Present Reflection</h3>
            <p className="text-sm text-[#e0ddd6] leading-relaxed mb-4">
              Compare your synthetic past ambitions with present-day evidence. No confidence percentages — only cited references and clear uncertainty.
            </p>
            <ul className="text-sm text-[#c5c0b5] space-y-2">
              <li className="flex gap-3"><span className="text-amber-300 shrink-0">—</span> <span>Compare predictions with outcomes</span></li>
              <li className="flex gap-3"><span className="text-amber-300 shrink-0">—</span> <span>Identify belief shifts over time</span></li>
              <li className="flex gap-3"><span className="text-amber-300 shrink-0">—</span> <span>Note unverified assumptions</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-4 panel-glass rounded-2xl p-5 shadow-xl shadow-black/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <h4 className="text-sm font-bold text-[#f5d89a]">Ghost Chamber — Live Conversation</h4>
            <span className="text-[10px] text-[#8895a0] ml-auto">Synthetic simulation · Evidence-grounded</span>
          </div>
          <div className="bg-[#020617]/60 rounded-xl p-4 h-72 overflow-y-auto space-y-3 border border-white/5">
            {messages.length === 0 && (
              <p className="text-xs text-[#8895a0]">Start a conversation with your 2016 self. No fabricated answers — every response uses real inference through Gemma 3:4b.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${m.role === 'user' ? 'bg-[#2a2535]/80 text-[#f3f0e8] border border-white/10' : 'bg-slate-900/60 text-[#e0ddd6] border border-amber-200/20'}`}>
                  <div>{m.content}</div>
                  {m.role === 'assistant' && m.evidence && m.evidence.length > 0 && (
                    <div className="mt-2 text-[10px] text-[#b8b4a8] leading-snug">
                      Evidence: {m.evidence.map(e => e.source).join(", ")}
                      {m.evidence.map((e, idx) => (
                        <span key={idx} className="block mt-1 text-[#8895a0]">{`- ${e.source}: ${e.status}`}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {generating && (
              <div className="flex justify-start gap-3">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-slate-900/60 text-[#c5c0b5] border border-amber-200/10 shadow-md animate-pulse">
                  Generating response via Gemma 3:4b...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your 2016 self... (e.g., What did I believe about the future?)"
              className="flex-1 rounded-full px-4 py-2 bg-[#020617]/80 text-sm text-[#f3f0e8] border border-white/10 placeholder-[#8895a0] focus:outline-none focus:ring-1 focus:ring-amber-300/40 transition shadow-inner"
              disabled={generating}
              aria-label="Message input for Ghost Chamber"
            />
            <button
              onClick={handleSend}
              disabled={generating || !input.trim()}
              className="rounded-full px-5 py-2 bg-[#f5d89a]/90 text-[#0f172a] text-sm font-bold hover:bg-[#f5d89a] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-amber-200/10"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-[#8895a0]">
            <span>Real inference · {conversationId}</span>
            <span>·</span>
            <span className="text-amber-300">{generating ? "Generating..." : "Ready"}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-[#8895a0] pb-8">
        <p>Tomorrow's Ghost · Local-first · Synthetic fixtures only · No real memory data committed</p>
        <p className="mt-1">Frontend: localhost:5174 · Backend: localhost:8002 · Ollama: localhost:11434</p>
        <p className="mt-1">Stage 1 · Foundation verified</p>
      </footer>
    </main>
  );
}

export default App;
