import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChainCourt - Decentralized Dispute Resolution',
  description: 'AI-powered arbitration on the blockchain. Resolve disputes fairly and transparently.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050505] text-white antialiased`}>
        <WalletProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-80px)] flex flex-col">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
