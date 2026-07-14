"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Scale, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="z-10 text-center max-w-4xl mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Next-Gen Escrow Protocol
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]"
        >
          Trustless Justice for the <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text">Digital Economy</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-lg md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Secure your freelance contracts, payments, and online agreements with AI-powered, decentralized arbitration on Soroban.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-[#050505] font-bold py-4 px-8 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Launch App
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/escrow/new">
            <button className="flex items-center justify-center w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-4 px-8 rounded-full transition-all hover:scale-105">
              Create Escrow
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="z-10 mt-32 mb-20 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
            title: "Cryptographic Escrow",
            desc: "Funds are locked securely in Soroban smart contracts, eliminating counterparty risk."
          },
          {
            icon: <Zap className="w-8 h-8 text-purple-400" />,
            title: "AI Arbiter",
            desc: "Disputes are instantly analyzed by an unbiased AI oracle, generating fair settlement summaries."
          },
          {
            icon: <Scale className="w-8 h-8 text-blue-400" />,
            title: "Decentralized Justice",
            desc: "Future integration with human juries and reputation tokens ensures ultimate fairness."
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
            className="bg-white/5 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:bg-white/10 transition-colors"
          >
            <div className="p-3 bg-white/5 rounded-2xl inline-block mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-gray-400 font-light leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
