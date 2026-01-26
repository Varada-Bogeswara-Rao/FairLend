'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Home() {
  const { connected } = useWallet();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'black', color: 'white', padding: '40px' }}>

      {/* Hero Box */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #333',
        padding: '60px',
        maxWidth: '800px',
        margin: '0 auto 40px auto',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>FairLend</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px', color: '#ccc' }}>
          Trust-based lending on Solana. Your reputation is your collateral.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          {connected ? (
            <Link href="/dashboard">
              <button style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <WalletMultiButton style={{ backgroundColor: '#222', border: '1px solid #444' }} />
          )}
        </div>
      </div>

      {/* Info Boxes */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>

        <div style={{ backgroundColor: '#111', border: '1px solid #333', padding: '30px' }}>
          <h3>1. Check Score</h3>
          <p style={{ color: '#888', marginTop: '10px' }}>Your on-chain activity determines your trust tier.</p>
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #333', padding: '30px' }}>
          <h3>2. Deposit</h3>
          <p style={{ color: '#888', marginTop: '10px' }}>Deposit SOL as collateral to start.</p>
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #333', padding: '30px' }}>
          <h3>3. Borrow</h3>
          <p style={{ color: '#888', marginTop: '10px' }}>Borrow USDC up to your tier limit.</p>
        </div>

      </div>

    </main>
  );
}
