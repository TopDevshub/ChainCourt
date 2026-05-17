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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        ChainCourt - AI Dispute Resolution
      </h1>
      
      <div className="w-full max-w-xl bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4">Active Escrow: ESC-1234</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Submit Evidence (Chat Logs, Commits)</label>
          <textarea
            className="w-full h-32 bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your evidence here for the AI to summarize..."
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
          ></textarea>
        </div>

        <button
          onClick={raiseDispute}
          disabled={loading || !evidence}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          {loading ? 'Processing via AI & Smart Contract...' : 'Raise Dispute & Generate AI Summary'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-700 rounded-md border-l-4 border-purple-500">
            <h3 className="font-bold text-lg mb-2 text-purple-400">AI & Contract Response:</h3>
            <p className="text-sm text-gray-300"><strong>Status:</strong> {result.data.contractStatus}</p>
            <p className="text-sm text-gray-300 mt-2"><strong>AI Summary:</strong></p>
            <p className="text-sm italic text-gray-400 mt-1">"{result.data.aiSummary}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
