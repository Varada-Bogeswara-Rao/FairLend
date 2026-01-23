"use client";
import "./polyfills";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { PublicKey, Transaction, TransactionInstruction, Connection, clusterApiUrl, Ed25519Program } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Buffer } from "buffer";
import Navbar from "./components/Navbar";

// Polyfill Buffer
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

// --- TIER CONFIGURATION ---
const TIER_CONFIG: Record<string, { color: string, bgColor: string, gradient: string, ltv: number, icon: string }> = {
  Gold: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    gradient: "from-amber-400 via-yellow-500 to-amber-600",
    ltv: 85,
    icon: "👑"
  },
  Silver: {
    color: "text-slate-300",
    bgColor: "bg-slate-500/10",
    gradient: "from-slate-300 via-slate-400 to-slate-500",
    ltv: 70,
    icon: "🥈"
  },
  Bronze: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    gradient: "from-orange-400 via-orange-500 to-red-600",
    ltv: 50,
    icon: "🥉"
  }
};

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connected, sendTransaction } = wallet;

  const [score, setScore] = useState<number | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [attestation, setAttestation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [borrowAmount, setBorrowAmount] = useState("");
  const [status, setStatus] = useState("");

  const fetchAttestation = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_ATTESTATION_API || "http://localhost:3001/getAttestedScore";
      const bust = Date.now();
      const res = await fetch(`${apiUrl}?wallet=${publicKey.toBase58()}&_t=${bust}`);
      const data = await res.json();

      if (data.attestation) {
        setScore(data.attestation.score);
        const tierMap: Record<number, string> = { 1: "Bronze", 2: "Silver", 3: "Gold" };
        setTier(tierMap[data.attestation.tier] || "Bronze");
        setAttestation(data);
      }
      return data;
    } catch (err: any) {
      console.error(err);
      setStatus("Error fetching FairScore");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchAttestation();
    } else {
      setScore(null);
      setTier(null);
      setAttestation(null);
      setStatus("");
    }
  }, [connected, publicKey]);

  const handleBorrow = async () => {
    if (!publicKey || !sendTransaction) return;
    setStatus("Processing...");

    try {
      const freshData = await fetchAttestation();
      if (!freshData || !freshData.attestation) {
        throw new Error("Failed to get fresh attestation");
      }

      const attData = freshData.attestation;
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet");
      const connection = new Connection(rpcUrl, "confirmed");

      const attesterPublicKey = new PublicKey("2xGDcaYgTLjzVdXZobAi3mFKgqEr4jXvWu7pibWeUXjF");
      const signatureUint8 = new Uint8Array(attData.signature);

      const buffer = new ArrayBuffer(32 + 4 + 1 + 8);
      const view = new DataView(buffer);
      let offset = 0;

      const walletBytes = new PublicKey(attData.wallet).toBuffer();
      for (let i = 0; i < 32; i++) { view.setUint8(offset + i, walletBytes[i]); } offset += 32;
      view.setUint32(offset, attData.score, true); offset += 4;
      view.setUint8(offset, attData.tier); offset += 1;
      view.setBigInt64(offset, BigInt(attData.timestamp), true);

      const message = Buffer.from(buffer);

      const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
        publicKey: attesterPublicKey.toBuffer(),
        message: message,
        signature: signatureUint8,
      });

      const programId = new PublicKey("H8Xjw5efShAHNmKL1fJQs1VMNbSc996y1NavEEwLMSdR");

      const argsBuffer = new ArrayBuffer(8 + 4 + 1 + 8);
      const argsView = new DataView(argsBuffer);
      let argsOffset = 0;

      const discriminator = Uint8Array.from([0x82, 0x26, 0x0e, 0x94, 0x26, 0xb4, 0xb0, 0x1b]);
      for (let i = 0; i < 8; i++) argsView.setUint8(argsOffset + i, discriminator[i]); argsOffset += 8;

      argsView.setUint32(argsOffset, Number(attData.score), true); argsOffset += 4;
      argsView.setUint8(argsOffset, Number(attData.tier)); argsOffset += 1;
      argsView.setBigInt64(argsOffset, BigInt(attData.timestamp), true);

      const validateIx = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: anchor.web3.SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: programId,
        data: Buffer.from(argsBuffer)
      });

      const transaction = new Transaction().add(ed25519Ix).add(validateIx);

      setStatus("Awaiting signature...");
      const signature = await sendTransaction(transaction, connection, { skipPreflight: true });
      setStatus("Confirming...");
      await connection.confirmTransaction(signature, "confirmed");

      setStatus("Success! Borrowed " + borrowAmount + " USDC");
      setTimeout(() => {
        setStatus("");
        setBorrowAmount("");
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setStatus("Transaction Failed");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const currentTier = tier && TIER_CONFIG[tier] ? TIER_CONFIG[tier] : TIER_CONFIG.Bronze;

  return (
    <>
      <Navbar />

      <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-24 relative">

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto">

          {/* Hero Header */}
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
              Reputation becomes<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">currency</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Unlock undercollateralized loans powered by your on-chain reputation score
            </p>
          </header>

          {!connected ? (
            /* Disconnected State */
            <div className="max-w-lg mx-auto">
              <div className="glass-card rounded-3xl p-12 text-center shadow-2xl shadow-black/50">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-8">Link your Solana wallet to reveal your FairScore and borrowing power</p>
                <div className="text-xs text-gray-500">Supported: Phantom, Solflare, Backpack</div>
              </div>
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="max-w-lg mx-auto">
              <div className="glass-card rounded-3xl p-16 text-center shadow-2xl shadow-black/50">
                <div className="w-16 h-16 mx-auto mb-6 border-4 border-white/10 border-t-amber-400 rounded-full animate-spin"></div>
                <p className="text-xl text-white font-medium">Calculating Your FairScore</p>
                <p className="text-gray-400 mt-2">Analyzing on-chain reputation...</p>
              </div>
            </div>
          ) : score !== null ? (
            /* Dashboard Layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT COLUMN: Score Card (spans 2 cols on lg) */}
              <div className="lg:col-span-2 glass-card rounded-3xl p-8 shadow-2xl shadow-black/50">

                {/* Section Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1">Your FairScore</p>
                    <h2 className="text-2xl font-bold text-white">Reputation Dashboard</h2>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">Active</span>
                  </div>
                </div>

                {/* Score Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                  {/* Score Box */}
                  <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4">Score</p>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-6xl font-bold text-white font-serif leading-none">{score}</span>
                      <span className="text-2xl text-gray-600 font-light pb-1">/ 1000</span>
                    </div>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10">
                      <div
                        className={`h-full bg-gradient-to-r ${currentTier.gradient} transition-all duration-1000 ease-out shadow-lg`}
                        style={{ width: `${(score / 1000) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Tier Box */}
                  <div className={`${currentTier.bgColor} rounded-2xl p-6 border border-white/10`}>
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-4">Tier Level</p>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-5xl">{currentTier.icon}</span>
                      <div>
                        <span className={`text-4xl font-bold font-serif ${currentTier.color}`}>{tier}</span>
                        <p className="text-sm text-gray-400 mt-1">Reputation Tier</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/5 text-center">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">Max LTV</p>
                    <p className="text-3xl font-bold text-white">{currentTier.ltv}%</p>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/5 text-center">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">Borrows</p>
                    <p className="text-3xl font-bold text-white">0</p>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-5 border border-white/5 text-center">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">Available</p>
                    <p className="text-3xl font-bold text-green-400">$5,000</p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Borrow Card */}
              <div className="glass-card rounded-3xl p-8 shadow-2xl shadow-black/50 flex flex-col">

                {/* Section Header */}
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1">Quick Action</p>
                  <h2 className="text-2xl font-bold text-white">Borrow USDC</h2>
                </div>

                {/* Borrow Form */}
                <div className="flex-grow flex flex-col gap-6">

                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(e.target.value)}
                        disabled={tier === 'Bronze'}
                        className="w-full bg-black/40 border-2 border-white/10 rounded-xl p-5 text-3xl font-mono text-white placeholder-gray-700 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all text-right pr-20"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">USDC</span>
                    </div>
                  </div>

                  {/* Tier Lock Warning */}
                  {tier === 'Bronze' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-red-400 font-semibold text-sm">Tier Locked</p>
                        <p className="text-red-400/70 text-xs mt-1">Bronze tier cannot borrow. Improve your score to Silver or Gold.</p>
                      </div>
                    </div>
                  )}

                  {/* Status Indicator */}
                  {status && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
                      <span className="text-amber-400 font-medium text-sm">{status}</span>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-grow"></div>

                  {/* CTA Button */}
                  <button
                    onClick={handleBorrow}
                    disabled={tier === 'Bronze' || !borrowAmount || loading}
                    className={`w-full py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${tier === 'Bronze' || !borrowAmount
                        ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/10"
                        : "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-110"
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{loading ? "Processing..." : "Verify & Borrow"}</span>
                  </button>

                  <p className="text-center text-xs text-gray-500">
                    Powered by Kamino Finance
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
