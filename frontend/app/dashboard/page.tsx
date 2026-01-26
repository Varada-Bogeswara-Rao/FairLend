'use client';

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { api } from '@/lib/api';
import { Buffer } from 'buffer';

export default function Dashboard() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, connected } = useWallet();
    const [depositAmount, setDepositAmount] = useState('');
    const [borrowAmount, setBorrowAmount] = useState('');
    const [collateral, setCollateral] = useState(0);
    const [borrowed, setBorrowed] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Mock data (Update this with real data fetching later if needed)
    type Tier = 'Bronze' | 'Silver' | 'Gold';
    const fairScore = 35;
    const tier: Tier = 'Silver' as Tier;
    const maxLTV = tier === 'Gold' ? 0.75 : tier === 'Silver' ? 0.60 : 0.50;
    const maxBorrow = collateral * 100 * maxLTV; // Assuming 1 SOL = $100 for demo

    const handleDeposit = async () => {
        if (!publicKey) return;
        const amount = parseFloat(depositAmount);
        if (!amount || amount <= 0) {
            alert('Enter a valid amount');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Get instructions from backend
            const amountLamports = amount * 1_000_000_000; // SOL to Lamports
            const response = await api.depositRequest(publicKey.toBase58(), amountLamports);

            if (!response.success || !response.instructions) {
                throw new Error(response.error || 'Failed to get deposit instructions');
            }

            // 2. Construct Transaction
            const transaction = new Transaction();

            const ixs = response.instructions.map(ix => new TransactionInstruction({
                programId: new PublicKey(ix.programId),
                keys: ix.keys.map(k => ({
                    pubkey: new PublicKey(k.pubkey),
                    isSigner: k.isSigner,
                    isWritable: k.isWritable
                })),
                data: Buffer.from(ix.data, 'base64')
            }));

            transaction.add(...ixs);

            // 3. Send Transaction
            const signature = await sendTransaction(transaction, connection);

            // 4. Confirm (Optional: wait for confirmation)
            await connection.confirmTransaction(signature, 'confirmed');

            setCollateral(prev => prev + amount);
            setDepositAmount('');
            alert(`Deposited ${amount} SOL successfully! Signature: ${signature.slice(0, 8)}...`);

        } catch (error: any) {
            console.error('Deposit failed:', error);
            alert(`Deposit failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBorrow = async () => {
        if (!publicKey) return;
        const amount = parseFloat(borrowAmount);
        if (!amount || amount <= 0) {
            alert('Enter a valid amount');
            return;
        }
        if (amount > maxBorrow - borrowed) {
            alert(`Exceeds max borrow limit. You can borrow up to ${(maxBorrow - borrowed).toFixed(2)} USDC`);
            return;
        }

        setIsLoading(true);
        try {
            // 1. Get instructions from backend
            // USDC has 6 decimals usually. Assuming backend expects base units.
            const amountBaseUnits = Math.floor(amount * 1_000_000);
            const response = await api.borrowRequest(publicKey.toBase58(), amountBaseUnits);

            if (!response.success || !response.instructions) {
                throw new Error(response.error || 'Failed to get borrow instructions');
            }

            if (response.riskMetadata) {
                console.log('Risk Assessment:', response.riskMetadata);
            }

            // 2. Construct Transaction
            const transaction = new Transaction();

            const ixs = response.instructions.map(ix => new TransactionInstruction({
                programId: new PublicKey(ix.programId),
                keys: ix.keys.map(k => ({
                    pubkey: new PublicKey(k.pubkey),
                    isSigner: k.isSigner,
                    isWritable: k.isWritable
                })),
                data: Buffer.from(ix.data, 'base64')
            }));

            transaction.add(...ixs);

            // 3. Send Transaction
            const signature = await sendTransaction(transaction, connection);

            // 4. Confirm
            await connection.confirmTransaction(signature, 'confirmed');

            setBorrowed(prev => prev + amount);
            setBorrowAmount('');
            alert(`Borrowed ${amount} USDC successfully! Signature: ${signature.slice(0, 8)}...`);

        } catch (error: any) {
            console.error('Borrow failed:', error);
            alert(`Borrow failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!connected) {
        return (
            <main style={{ minHeight: '100vh', backgroundColor: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Connecting wallet...</p>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'black', color: 'white', padding: '40px' }}>

            {/* Box 1: User Details (Big Rectangle) */}
            <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                padding: '40px',
                marginBottom: '40px'
            }}>
                <h2 style={{ marginBottom: '20px' }}>User Details</h2>
                <p>Wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}</p>
                <p>FairScore: {fairScore}</p>
                <p>Tier: {tier}</p>
                <p>Collateral: {collateral.toFixed(2)} SOL</p>
                <p>Borrowed: {borrowed.toFixed(2)} USDC</p>
                <p>Max Borrow: {maxBorrow.toFixed(2)} USDC</p>
            </div>

            {/* Box 2: Actions (Square Box) */}
            <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                padding: '40px',
                maxWidth: '500px'
            }}>
                <h2 style={{ marginBottom: '20px' }}>Actions</h2>

                {/* Deposit */}
                <div style={{ marginBottom: '20px' }}>
                    <label>Deposit Collateral (SOL)</label>
                    <br />
                    <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        disabled={isLoading}
                        style={{ padding: '10px', marginTop: '5px', marginRight: '10px', backgroundColor: '#222', color: 'white', border: '1px solid #444' }}
                    />
                    <button
                        onClick={handleDeposit}
                        disabled={isLoading}
                        style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        {isLoading ? 'Loading...' : 'Deposit'}
                    </button>
                </div>

                {/* Borrow */}
                <div>
                    <label>Borrow (USDC)</label>
                    <br />
                    <input
                        type="number"
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(e.target.value)}
                        placeholder="0.00"
                        disabled={isLoading || collateral === 0}
                        style={{ padding: '10px', marginTop: '5px', marginRight: '10px', backgroundColor: '#222', color: 'white', border: '1px solid #444' }}
                    />
                    <button
                        onClick={handleBorrow}
                        disabled={isLoading || collateral === 0}
                        style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        {isLoading ? 'Loading...' : 'Borrow'}
                    </button>
                </div>

                {collateral === 0 && (
                    <p style={{ marginTop: '20px', color: '#888' }}>Deposit collateral first to enable borrowing.</p>
                )}
            </div>

        </main>
    );
}
