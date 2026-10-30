import { useState, useEffect } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [connected, setConnected] = useState(false);

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#0b1220] to-[#020617] text-slate-200">
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

        <div className="mt-6 panel-glass rounded-2xl p-7 shadow-xl shadow-black/20">
          <h3 className="text-lg font-bold text-slate-200 mb-2">Future Time Capsule</h3>
          <p className="text-sm text-[#b0a898] mb-4">Create a message for a future version of yourself. Stored locally. Synthetic fixtures only — no real personal data committed.</p>
          <button
            disabled={true}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-[#1a1520]/70 text-[#b8b4a8] border border-[#2a2535] cursor-not-allowed opacity-60 text-sm"
            aria-label="Future capsule feature — coming in next stage"
          >
            <span>Create Capsule</span>
            <span aria-hidden="true">(Available in Stage 2)</span>
          </button>
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
