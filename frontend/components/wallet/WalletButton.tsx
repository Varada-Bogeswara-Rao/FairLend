'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { shortenWalletAddress } from '@/lib/utils';

/**
 * Solana wallet connection button
 * Shows wallet address when connected
 */
export default function WalletButton() {
    const { publicKey, disconnect, connected } = useWallet();

    if (connected && publicKey) {
        return (
            <div className="flex items-center gap-3">
                {/* Network Badge */}
                <div className="px-3 py-1 bg-warning-amber/20 border border-warning-amber rounded-full text-warning-amber text-sm font-semibold">
                    Devnet
                </div>

                {/* Wallet Address */}
                <div className="px-4 py-2 bg-bg-card border border-border-primary rounded-button text-text-primary font-mono text-sm">
                    {shortenWalletAddress(publicKey.toBase58())}
                </div>

                {/* Disconnect Button */}
                <button
                    onClick={disconnect}
                    className="px-4 py-2 bg-transparent border-2 border-error-red text-error-red rounded-button font-semibold hover:bg-error-red hover:text-white transition-all duration-200"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <WalletMultiButton className="!bg-accent-emerald !text-white !rounded-button !px-6 !py-3 !font-semibold hover:!shadow-glow-emerald !transition-all" />
    );
}
