"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';
import { PlusCircle, Search, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { publicKey } = useWallet();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEscrows = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/escrow');
        const data = await res.json();
        if (data.success) {
          // In a real app, we'd filter by publicKey, but for MVP we show all or just mock it.
          setEscrows(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch escrows', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEscrows();
  }, [publicKey]);

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'disputed': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'resolved': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Escrows</h1>
          <p className="text-gray-400 font-light">Manage your active contracts and disputes.</p>
        </div>
        <Link href="/escrow/new">
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]">
            <PlusCircle className="w-5 h-5" />
            New Escrow
          </button>
        </Link>
      </div>

      <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by ID or address..." 
              className="w-full bg-[#050505] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading escrows...</div>
        ) : escrows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <PlusCircle className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No active escrows</h3>
            <p className="text-gray-500 mb-6">You don't have any escrows associated with this wallet.</p>
            <Link href="/escrow/new" className="text-indigo-400 hover:text-indigo-300 font-medium">Create your first one &rarr;</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {escrows.map((escrow, idx) => (
              <motion.div 
                key={escrow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link href={`/escrow/${escrow.id}`} className="block p-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${getStatusColor(escrow.state)}`}>
                          {escrow.state.toUpperCase()}
                        </span>
                        <span className="text-sm font-mono text-gray-500 truncate max-w-[200px]">ID: {escrow.id.substring(0,8)}...</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Contractor</p>
                          <p className="text-gray-300 font-mono truncate">{escrow.contractor.substring(0, 12)}...</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Amount</p>
                          <p className="text-emerald-400 font-medium">{escrow.amount} XLM</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
