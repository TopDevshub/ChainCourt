"use client";
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { Wallet, Scale, LayoutDashboard, PlusCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { publicKey, connectWallet } = useWallet();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0a0a0c]/80 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all">
              <Scale className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Chain<span className="text-indigo-400">Court</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${isActive('/dashboard') ? 'text-indigo-400' : 'text-gray-300'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              href="/escrow/new" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${isActive('/escrow/new') ? 'text-indigo-400' : 'text-gray-300'}`}
            >
              <PlusCircle className="w-4 h-4" />
              Create Escrow
            </Link>
            <div className="w-px h-6 bg-white/10 mx-2 hidden lg:block"></div>
            <Link 
              href="/juror" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-orange-400 ${isActive('/juror') ? 'text-orange-400' : 'text-gray-300'}`}
            >
              <Scale className="w-4 h-4" />
              Juror Portal
            </Link>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center">
            {!publicKey ? (
              <button 
                onClick={connectWallet}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-medium py-2 px-5 rounded-full transition-all hover:scale-105 active:scale-95"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-gray-400 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full font-mono">
                  {publicKey.substring(0, 6)}...{publicKey.substring(publicKey.length - 4)}
                </span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center border-2 border-[#0a0a0c] shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
