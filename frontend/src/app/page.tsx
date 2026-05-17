"use client";
import { useState } from 'react';

export default function Home() {
  const [evidence, setEvidence] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const raiseDispute = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowId: 'ESC-1234', evidence }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative flex flex-col items-center py-16 px-4 font-sans">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/30 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/30 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="z-10 text-center mb-12 max-w-2xl">
        <div className="inline-block px-4 py-1 mb-6 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          Decentralized Dispute Resolution
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text">Chain</span>
          <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Court</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
          AI-powered arbitration on the blockchain. Resolve disputes fairly, transparently, and instantly without the legal fees.
        </p>
      </div>
      
      {/* Main Card */}
      <div className="z-10 w-full max-w-3xl bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-white/10 gap-4 sm:gap-0">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              Active Escrow
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </h2>
            <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
              Contract ID: 
              <span className="font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">ESC-1234</span>
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-gray-300 text-sm font-medium border border-white/10 backdrop-blur-md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Secured on Soroban
            </span>
          </div>
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Submit Evidence
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <textarea
              className="relative w-full h-48 bg-[#050505] border border-white/10 rounded-xl p-5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none font-mono text-sm shadow-inner"
              placeholder="Paste chat logs, project specifications, or commit histories here. The AI Oracle will analyze this to generate an unbiased summary for the smart contract..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            ></textarea>
          </div>
        </div>

        <button
          onClick={raiseDispute}
          disabled={loading || !evidence}
          className={`w-full relative overflow-hidden rounded-xl font-bold py-4 px-6 transition-all duration-300 transform flex justify-center items-center gap-2 ${
            loading || !evidence 
              ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-1 hover:scale-[1.01]'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Analyzing via AI Oracle...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              <span>Analyze Evidence & Raise Dispute</span>
            </>
          )}
        </button>

        {result && (
          <div className="mt-8 overflow-hidden rounded-2xl bg-[#0d0d12] border border-indigo-500/30 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500"></div>
            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h3 className="font-semibold text-indigo-300 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path></svg>
                AI Verdict Summary
              </h3>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Smart Contract Updated
              </span>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light">
                    {result.data.aiSummary}
                  </p>
                  
                  <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">State Status</p>
                      <p className="text-sm font-mono text-orange-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                        {result.data.contractStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Tx Hash</p>
                      <p className="text-sm font-mono text-gray-400 truncate">0x8f2a...91b4</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-16 text-center text-gray-600 text-sm font-light flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
        <span>Built with Next.js, Express & Soroban</span>
      </div>
    </div>
  );
}
