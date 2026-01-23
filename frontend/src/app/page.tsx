"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletConnect } from "@/components/WalletConnect";
import { TrustBadge } from "@/components/TrustBadge";
import { BorrowForm } from "@/components/BorrowForm";
import { fetchAttestation, AttestationData } from "@/lib/attestation";

function Dashboard() {
  const { publicKey } = useWallet();
  const [attestation, setAttestation] = useState<AttestationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadAttestation = async () => {
    if (!publicKey) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchAttestation(publicKey);
      setAttestation(data);
    } catch (err: any) {
      setError(err.message);
      setAttestation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      loadAttestation();
    } else {
      setAttestation(null);
    }
  }, [publicKey]);

  return (
    <div className="min-h-screen text-white font-sans selection:bg-blue-500/30">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-block mb-3 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-widest">
              Solana RWA Lending Prototype
            </div>
            <h1 className="text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-sm">
              FairLend
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Your reputation is your collateral. <br />
              Leverage your <span className="text-white font-bold">FairScore</span> to unlock premium tiers and higher borrow limits.
            </p>
          </div>

          {!publicKey ? (
            <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-white/10 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">👛</span>
              </div>
              <p className="text-2xl text-slate-300 mb-2 font-light">Connect your wallet to begin</p>
              <p className="text-sm text-slate-500">We'll fetch your FairScore reputation automatically</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Reputation */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">
                    Reputation Status
                  </h2>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-4 text-sm backdrop-blur-md">
                      Error: {error}
                      <button onClick={loadAttestation} className="ml-4 underline hover:text-white">Retry</button>
                    </div>
                  )}

                  <TrustBadge
                    score={attestation ? attestation.score : 0}
                    tier={attestation ? attestation.tier : 1}
                    loading={loading}
                  />

                  <div className="mt-6 p-6 glass-panel rounded-2xl">
                    <p className="font-bold text-blue-300 mb-3 text-sm uppercase tracking-wide">System Rules</p>
                    <ul className="space-y-3 text-sm text-slate-300">
                      <li className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span>FairScore is fetched securely from FairScale API.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span>Attestations are signed offchain and verified onchain.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <span>Gold Tier (Score 75+) unlocks 85% LTV.</span>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>

              {/* Right Column: Lending */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">
                    Liquidity Market
                  </h2>
                  <BorrowForm
                    attestation={attestation}
                    refreshAttestation={loadAttestation}
                  />
                </section>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-12 text-slate-600 text-sm mt-12 bg-black/20 backdrop-blur-lg border-t border-white/5">
        <p>FairLend Prototype • Built with Anchor, Next.js & FairScale</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <WalletConnect>
      <Dashboard />
    </WalletConnect>
  );
}
