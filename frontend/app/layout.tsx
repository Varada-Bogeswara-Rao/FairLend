import type { Metadata } from 'next';
import './globals.css';
import WalletContextProvider from '@/components/providers/WalletProvider';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'FairLend - Trust-Based Lending on Solana',
  description: 'FairLend uses on-chain reputation (FairScore) to unlock safer, smarter borrowing on Solana.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <WalletContextProvider>
          <Navbar />
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
