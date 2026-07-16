"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Client, networks } from 'chaincourt';
import { signTransaction, setAllowed } from '@stellar/freighter-api';

export default function CreateEscrow() {
  const { publicKey, connectWallet } = useWallet();
  const router = useRouter();
  
  const [contractor, setContractor] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return alert('Please connect wallet first.');
    
    setLoading(true);
    try {
      // 1. Generate unique Escrow ID
      const escrowId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
      const amountStroops = BigInt(parseFloat(amount) * 10000000);
      
      // Native XLM token address on Testnet
      const nativeToken = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

      const client = new Client({
        ...networks.testnet,
        rpcUrl: 'https://soroban-testnet.stellar.org:443',
        allowHttp: true,
        publicKey,
      });

      console.log('Building transaction...');
      const tx = await client.create_escrow({
        id: escrowId,
        token: nativeToken,
        client: publicKey,
        contractor: contractor,
        amount: amountStroops
      });

      console.log('Prompting Freighter to sign...');
      await setAllowed();
      const result = await tx.signAndSend({
        signTransaction: async (xdr: string): Promise<any> => {
          return await signTransaction(xdr, { networkPassphrase: "Test SDF Network ; September 2015" });
        }
      });

      console.log('Transaction Result:', result);
      
      // 2. Sync with Backend
      const res = await fetch('http://localhost:3001/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: escrowId,
          client: publicKey, 
          contractor: contractor, 
          amount: parseFloat(amount),
          txHash: result.result // In a real app, backend would verify this hash
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        router.push(`/escrow/${data.data.id}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Transaction failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-8 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Escrow</h1>
            <p className="text-gray-400 text-sm">Lock funds securely on the Soroban network.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contractor Stellar Address</label>
            <input 
              type="text" 
              required
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              placeholder="G..." 
              className="w-full bg-[#050505] border border-white/10 rounded-lg py-3 px-4 text-gray-200 focus:outline-none focus:border-indigo-500/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount (XLM)</label>
            <div className="relative">
              <input 
                type="number" 
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00" 
                className="w-full bg-[#050505] border border-white/10 rounded-lg py-3 pl-4 pr-12 text-gray-200 focus:outline-none focus:border-indigo-500/50 font-mono"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">XLM</span>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-200">
              By clicking "Deposit & Lock", your Freighter wallet will be prompted to sign the transaction and lock the funds in the smart contract.
            </p>
          </div>

          {!publicKey ? (
            <button 
              type="button"
              onClick={connectWallet}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Connect Wallet to Continue
            </button>
          ) : (
            <button 
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-4 rounded-xl transition-all ${
                loading ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
              }`}
            >
              {loading ? 'Processing...' : 'Deposit & Lock Funds'}
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
