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
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              FairLend
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Reputation-based lending on Solana. <br />
              Leverage your <span className="text-white font-bold">FairScore</span> to unlock higher borrow limits.
            </p>
          </div>

          {!publicKey ? (
            <div className="text-center py-20 bg-gray-900 rounded-2xl border border-dashed border-gray-700">
              <p className="text-2xl text-gray-500 mb-6">Connect your wallet to see your Trust Tier</p>
              {/* Wallet button is in Navbar, pointing user there */}
              <div className="animate-bounce text-3xl">☝️</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Reputation */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>🛡️</span> Your Reputation
                  </h2>

                  {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-4 text-sm">
                      Error: {error}
                      <button onClick={loadAttestation} className="ml-4 underline">Retry</button>
                    </div>
                  )}

                  <TrustBadge
                    score={attestation ? attestation.score : 0}
                    tier={attestation ? attestation.tier : 1}
                    loading={loading}
                  />

                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg text-sm text-blue-200">
                    <p className="font-semibold mb-1">How it works:</p>
                    <ul className="list-disc pl-5 space-y-1 opacity-80">
                      <li>Your FairScore is fetched from FairScale.</li>
                      <li>Higher scores unlock Gold/Silver tiers.</li>
                      <li>Tiers determine your Max LTV on Kamino.</li>
                    </ul>
                  </div>
                </section>
              </div>

              {/* Right Column: Lending */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>💰</span> Borrow
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
      <footer className="text-center py-8 text-gray-600 text-sm mt-12 bg-black/20">
        FairLend Prototype • Powered by Solana, Anchor & FairScale
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
