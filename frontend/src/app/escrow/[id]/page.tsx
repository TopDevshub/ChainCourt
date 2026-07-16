"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShieldAlert, Bot } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { Client, networks } from 'chaincourt';
import { signTransaction, setAllowed } from '@stellar/freighter-api';

export default function EscrowDetails() {
  const params = useParams();
  const id = params.id as string;
  const { publicKey } = useWallet();
  
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState('');
  const [disputing, setDisputing] = useState(false);

  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/escrow/${id}`);
        const data = await res.json();
        if (data.success) setEscrow(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEscrow();
  }, [id]);

  const raiseDispute = async () => {
    if (!escrow) return;
    if (!publicKey) return alert("Connect wallet to raise dispute.");
    setDisputing(true);
    try {
      // 1. Get AI Summary from backend FIRST
      const analyzeRes = await fetch('http://localhost:3001/api/dispute/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidence }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeData.success) throw new Error(analyzeData.error);
      
      const aiSummary = analyzeData.data.aiSummary;

      // 2. Sign on-chain transaction
      const client = new Client({
        ...networks.testnet,
        rpcUrl: 'https://soroban-testnet.stellar.org:443',
        allowHttp: true,
        publicKey,
      });
      
      console.log('Building dispute transaction...');
      const tx = await client.raise_dispute({
        id: escrow.id,
        caller: publicKey,
        ai_summary: aiSummary.substring(0, 100)
      });

      console.log('Prompting Freighter to sign...');
      await setAllowed();
      const result = await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          const signed = await signTransaction(xdr, { network: "TESTNET" });
          return signed as string;
        }
      });

      // 3. Sync with backend
      const res = await fetch('http://localhost:3001/api/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          escrowId: escrow.id, 
          aiSummary,
          txHash: result.result
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEscrow(data.data);
      }
    } catch (err: any) {
      console.error(err);
      alert('Dispute failed: ' + err.message);
    } finally {
      setDisputing(false);
    }
  };

  const escalateToJury = async () => {
    if (!publicKey) return alert("Connect wallet to escalate.");
    try {
      const client = new Client({
        ...networks.testnet,
        rpcUrl: 'https://soroban-testnet.stellar.org:443',
        allowHttp: true,
        publicKey,
      });

      const tx = await client.escalate_to_jury({
        id: escrow.id,
        caller: publicKey,
      });

      await setAllowed();
      const result = await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          const signed = await signTransaction(xdr, { network: "TESTNET" });
          return signed as string;
        }
      });

      const res = await fetch('http://localhost:3001/api/dispute/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          escrowId: escrow.id,
          txHash: result.result
        }),
      });
      const data = await res.json();
      if (data.success) {
         alert("Escalated to Decentralized Jury!");
         setEscrow(data.data);
      }
    } catch (err: any) {
      console.error(err);
      alert('Escalation failed: ' + err.message);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading escrow details...</div>;
  if (!escrow) return <div className="p-20 text-center text-gray-500">Escrow not found.</div>;

  const isDisputed = escrow.state.toLowerCase() === 'disputed';
  const isResolved = escrow.state.toLowerCase() === 'resolved';

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Details */}
        <div className="md:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden"
          >
            {isDisputed && <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>}
            {isResolved && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
            {!isDisputed && !isResolved && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}

            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Escrow Details</h1>
                <p className="text-sm font-mono text-gray-500">ID: {escrow.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                isDisputed ? 'bg-orange-500/20 text-orange-400' : 
                isResolved ? 'bg-blue-500/20 text-blue-400' : 
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {escrow.state}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-white/[0.02] p-6 rounded-xl border border-white/5">
              <div>
                <p className="text-gray-500 text-sm mb-1">Client</p>
                <p className="font-mono text-gray-300 text-sm truncate">{escrow.client}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Contractor</p>
                <p className="font-mono text-gray-300 text-sm truncate">{escrow.contractor}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Amount Locked</p>
                <p className="text-emerald-400 font-bold text-xl">{escrow.amount} XLM</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Created At</p>
                <p className="text-gray-300 text-sm">{new Date(escrow.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>

          {/* Dispute Section */}
          {!isDisputed && !isResolved && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0a0a0c] border border-red-500/20 rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="text-red-400 w-6 h-6" />
                <h2 className="text-xl font-bold text-white">Raise a Dispute</h2>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                If the contractor failed to deliver the agreed-upon work, you can raise a dispute. Our AI Oracle will review the evidence and suggest a resolution.
              </p>
              <textarea
                className="w-full h-32 bg-[#050505] border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500/50 mb-4 resize-none text-sm"
                placeholder="Describe the issue and paste any relevant evidence (chat logs, specs)..."
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              ></textarea>
              <button
                onClick={raiseDispute}
                disabled={disputing || !evidence}
                className={`w-full font-bold py-3 rounded-xl transition-colors ${
                  disputing || !evidence ? 'bg-red-900/30 text-gray-500 cursor-not-allowed' : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                }`}
              >
                {disputing ? 'Analyzing Evidence...' : 'Submit Evidence & Dispute'}
              </button>
            </motion.div>
          )}

          {/* AI Summary Section */}
          {(isDisputed || isResolved) && escrow.aiSummary && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-900/10 border border-indigo-500/30 rounded-2xl p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 opacity-10">
                <Bot className="w-32 h-32 text-indigo-400" />
              </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Bot className="text-indigo-400 w-6 h-6" />
                <h2 className="text-xl font-bold text-indigo-100">AI Oracle Verdict</h2>
              </div>
              <p className="text-indigo-200/80 leading-relaxed relative z-10 whitespace-pre-wrap">
                {escrow.aiSummary}
              </p>
              
              {isDisputed && (
                <div className="mt-8 pt-6 border-t border-indigo-500/20 flex gap-4 relative z-10">
                   {/* In a real app, these would trigger Soroban resolve_dispute txs */}
                  <button className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-3 rounded-xl font-medium transition-colors border border-emerald-500/30">
                    Accept & Release Funds
                  </button>
                  <button 
                    onClick={escalateToJury}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-medium transition-colors border border-red-500/30"
                  >
                    Reject (Escalate to Jury)
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar Timeline */}
        <div className="md:col-span-1">
          <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 sticky top-28">
            <h3 className="text-lg font-bold text-white mb-6">Timeline</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="w-px h-full bg-white/10 my-2"></div>
                </div>
                <div className="pb-4">
                  <p className="text-white font-medium text-sm">Escrow Created</p>
                  <p className="text-gray-500 text-xs mt-1">Funds locked securely</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isDisputed || isResolved ? 'bg-orange-500/20 border-orange-500/30' : 'bg-white/5 border-white/10'}`}>
                    <ShieldAlert className={`w-4 h-4 ${isDisputed || isResolved ? 'text-orange-400' : 'text-gray-600'}`} />
                  </div>
                  <div className="w-px h-full bg-white/10 my-2"></div>
                </div>
                <div className="pb-4">
                  <p className={`font-medium text-sm ${isDisputed || isResolved ? 'text-white' : 'text-gray-600'}`}>Dispute Raised</p>
                  {isDisputed || isResolved ? (
                    <p className="text-gray-500 text-xs mt-1">AI review completed</p>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isResolved ? 'bg-blue-500/20 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                    <CheckCircle2 className={`w-4 h-4 ${isResolved ? 'text-blue-400' : 'text-gray-600'}`} />
                  </div>
                </div>
                <div>
                  <p className={`font-medium text-sm ${isResolved ? 'text-white' : 'text-gray-600'}`}>Resolved</p>
                  {isResolved ? (
                    <p className="text-gray-500 text-xs mt-1">Funds released</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
