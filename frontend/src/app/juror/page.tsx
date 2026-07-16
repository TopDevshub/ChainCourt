"use client";
import { useEffect, useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { motion } from 'framer-motion';
import { Scale, Users, Bot, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Client, networks } from 'chaincourt';
import { signTransaction, setAllowed } from '@stellar/freighter-api';

export default function JurorPortal() {
  const { publicKey, connectWallet } = useWallet();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingOn, setVotingOn] = useState<string | null>(null);

  const fetchCases = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/escrow');
      const data = await res.json();
      if (data.success) {
        // Filter only cases that are in "Voting" state
        setCases(data.data.filter((e: any) => e.state === 'Voting'));
      }
    } catch (err) {
      console.error('Failed to fetch cases', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const castVote = async (escrowId: string, voteFor: 'Client' | 'Contractor') => {
    if (!publicKey) return alert("Please connect your wallet first.");
    setVotingOn(escrowId);
    
    try {
      const client = new Client({
        ...networks.testnet,
        rpcUrl: 'https://soroban-testnet.stellar.org:443',
        allowHttp: true,
        publicKey,
      });

      console.log('Building vote transaction...');
      const tx = await client.cast_vote({
        id: escrowId,
        juror: publicKey,
        vote: { tag: voteFor, values: undefined }
      });

      console.log('Prompting Freighter to sign...');
      await setAllowed();
      const result = await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          const signed = await signTransaction(xdr, { network: "TESTNET" });
          return signed as string;
        }
      });

      // Sync with backend
      const res = await fetch('http://localhost:3001/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          escrowId, 
          jurorId: publicKey, 
          voteFor,
          txHash: result.result
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Vote cast successfully!");
        fetchCases(); // Refresh list
      } else {
        alert(data.error || "Failed to cast vote.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error casting vote: " + err.message);
    } finally {
      setVotingOn(null);
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 rounded-full mb-6 border border-orange-500/20">
          <Scale className="w-10 h-10 text-orange-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">Juror Portal</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
          Review evidence, read AI preliminary summaries, and cast your vote to resolve decentralized disputes. Earn rewards for voting with the majority consensus.
        </p>
      </div>

      {!publicKey ? (
        <div className="text-center p-12 bg-[#0a0a0c] rounded-2xl border border-white/10 max-w-lg mx-auto">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connect to participate</h2>
          <p className="text-gray-400 mb-6">You must connect your Freighter wallet to verify your identity as a juror.</p>
          <button 
            onClick={connectWallet}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)]"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">Active Cases Awaiting Verdict ({cases.length})</h2>
          </div>

          {loading ? (
            <div className="p-20 text-center text-gray-500">Loading active cases...</div>
          ) : cases.length === 0 ? (
            <div className="text-center p-16 bg-[#0a0a0c] border border-white/10 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300">No disputes available</h3>
              <p className="text-gray-500 mt-2">All escalated disputes have been resolved. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {cases.map((escrow) => (
                <motion.div 
                  key={escrow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row">
                    
                    {/* Details Column */}
                    <div className="lg:w-1/3 p-8 bg-white/[0.02] border-r border-white/10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-6">
                          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 font-bold text-xs uppercase rounded-full">
                            Voting Open
                          </span>
                          <span className="text-gray-500 text-xs font-mono">Case ID: {escrow.id.substring(0,8)}</span>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <p className="text-gray-500 text-sm mb-1">Total Locked</p>
                            <p className="text-emerald-400 font-bold text-2xl">{escrow.amount} XLM</p>
                          </div>
                          <div className="space-y-3">
                            <div className="bg-[#050505] p-3 rounded-lg border border-white/5">
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Client</p>
                              <p className="text-sm text-gray-300 font-mono truncate">{escrow.client}</p>
                            </div>
                            <div className="bg-[#050505] p-3 rounded-lg border border-white/5">
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Contractor</p>
                              <p className="text-sm text-gray-300 font-mono truncate">{escrow.contractor}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/10">
                         <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                           <AlertCircle className="w-4 h-4" /> Current Votes
                         </p>
                         <div className="flex gap-4">
                           <div className="flex-1 text-center bg-[#050505] p-2 rounded border border-white/5">
                             <p className="text-xl font-bold text-blue-400">{escrow.votesClient}</p>
                             <p className="text-xs text-gray-500">Client</p>
                           </div>
                           <div className="flex-1 text-center bg-[#050505] p-2 rounded border border-white/5">
                             <p className="text-xl font-bold text-indigo-400">{escrow.votesContractor}</p>
                             <p className="text-xs text-gray-500">Contractor</p>
                           </div>
                         </div>
                      </div>
                    </div>

                    {/* Evidence Column */}
                    <div className="lg:w-2/3 p-8">
                      <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                        <Bot className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-bold text-white">AI Oracle Preliminary Summary</h3>
                      </div>
                      <div className="bg-[#050505] border border-white/5 rounded-xl p-6 mb-8 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
                        {escrow.aiSummary || "No AI summary available."}
                      </div>

                      <h3 className="text-lg font-bold text-white mb-4">Cast Your Vote</h3>
                      <p className="text-gray-400 text-sm mb-6">Review the AI summary and cast your vote on who should receive the locked funds.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => castVote(escrow.id, 'Client')}
                          disabled={votingOn === escrow.id}
                          className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                          {votingOn === escrow.id ? 'Casting Vote...' : 'Vote for Client'}
                        </button>
                        <button
                          onClick={() => castVote(escrow.id, 'Contractor')}
                          disabled={votingOn === escrow.id}
                          className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                          {votingOn === escrow.id ? 'Casting Vote...' : 'Vote for Contractor'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
