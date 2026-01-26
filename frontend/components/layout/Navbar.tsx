'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Navbar() {
    return (
        <nav style={{
            backgroundColor: 'black',
            borderBottom: '1px solid #333',
            padding: '20px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none' }}>
                <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>FairLend</h1>
            </Link>

            {/* Wallet Button */}
            <div>
                <WalletMultiButton style={{ backgroundColor: '#222', border: '1px solid #444', height: '40px' }} />
            </div>
        </nav>
    );
}
