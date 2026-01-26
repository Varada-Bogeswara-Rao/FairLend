'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import ScoreMeter from '@/components/ui/ScoreMeter';
import TierBadge from '@/components/ui/TierBadge';
import SecondaryButton from '@/components/ui/SecondaryButton';
import Link from 'next/link';
import { getTierFromScore, getLTVForTier, type Tier } from '@/lib/utils';

/**
 * Score Details Page
 * Explains FairScore, tier system, and how to improve trust
 */
export default function ScorePage() {
    const { connected } = useWallet();
    const router = useRouter();

    // Mock data - replace with actual API calls
    const [fairScore] = useState(35);
    const tier: Tier = getTierFromScore(fairScore);
    const maxLTV = getLTVForTier(tier);

    // Redirect if not connected
    useEffect(() => {
        if (!connected) {
            const timer = setTimeout(() => {
                if (!connected) {
                    router.push('/');
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [connected, router]);

    if (!connected) {
        return (
            <main className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-4xl">🔐</div>
                    <p className="text-text-secondary text-xl">Connecting wallet...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-bg-primary py-8">
            <div className="max-w-4xl mx-auto px-6">
                {/* Page Header */}
                <div className="mb-8 fade-in">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Your FairScore</h1>
                    <p className="text-text-secondary">Understanding your on-chain reputation and trust tier</p>
                </div>

                {/* Main Score Display */}
                <div className="bg-bg-card border border-border-secondary rounded-card p-12 text-center space-y-8 fade-in mb-8">
                    {/* Large Score Meter */}
                    <ScoreMeter score={fairScore} tier={tier} size="lg" />

                    {/* Tier Badge */}
                    <div className="flex justify-center">
                        <TierBadge tier={tier} size="lg" />
                    </div>

                    {/* Score Details */}
                    <div className="space-y-4 max-w-md mx-auto">
                        <div className="flex justify-between items-center py-3 border-b border-border-secondary">
                            <span className="text-text-muted">Current Score</span>
                            <span className="text-2xl font-bold text-text-primary">{fairScore}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-border-secondary">
                            <span className="text-text-muted">Trust Tier</span>
                            <span className="text-2xl font-bold text-text-primary">{tier}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-text-muted">Max LTV</span>
                            <span className="text-2xl font-bold text-accent-emerald">{(maxLTV * 100).toFixed(0)}%</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <Link href="/dashboard" className="inline-block">
                        <SecondaryButton>Back to Dashboard</SecondaryButton>
                    </Link>
                </div>

                {/* Why Reputation Matters */}
                <div className="bg-bg-card border border-border-secondary rounded-card p-8 space-y-6 fade-in mb-8">
                    <h2 className="text-2xl font-bold text-text-primary">Why Reputation Matters</h2>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="text-2xl">🛡️</div>
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary mb-1">Risk-Adjusted Lending</h3>
                                <p className="text-text-secondary">
                                    Traditional lending ignores individual behavior. FairLend uses your on-chain history to determine risk,
                                    rewarding trustworthy borrowers with better terms.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="text-2xl">📈</div>
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary mb-1">Progressive Unlocks</h3>
                                <p className="text-text-secondary">
                                    As your FairScore increases, you unlock higher loan-to-value ratios. Bronze starts at 50% LTV,
                                    while Gold tier borrowers can access up to 75% LTV.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="text-2xl">⛓️</div>
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary mb-1">On-Chain Enforcement</h3>
                                <p className="text-text-secondary">
                                    Your tier is verified through cryptographic attestations. Nobody can bypass the rules - not even the protocol.
                                    Trust is enforced at the smart contract level.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How to Improve Your Score */}
                <div className="bg-bg-card border border-border-secondary rounded-card p-8 space-y-6 fade-in">
                    <h2 className="text-2xl font-bold text-text-primary">How to Improve Your FairScore</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-accent-emerald/10 border border-accent-emerald/30 rounded-button">
                            <h3 className="text-lg font-semibold text-accent-emerald mb-2">✓ Positive Factors</h3>
                            <ul className="space-y-2 text-text-secondary text-sm">
                                <li>• Consistent loan repayments</li>
                                <li>• Long wallet history on Solana</li>
                                <li>• Participation in governance</li>
                                <li>• Maintaining collateral ratios</li>
                                <li>• DeFi protocol interactions</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-error-red/10 border border-error-red/30 rounded-button">
                            <h3 className="text-lg font-semibold text-error-red mb-2">✗ Negative Factors</h3>
                            <ul className="space-y-2 text-text-secondary text-sm">
                                <li>• Liquidations on positions</li>
                                <li>• Late or missed repayments</li>
                                <li>• New or empty wallets</li>
                                <li>• Suspicious transaction patterns</li>
                                <li>• Association with flagged addresses</li>
                            </ul>
                        </div>
                    </div>

                    <div className="p-4 bg-accent-cyan/10 border border-accent-cyan/30 rounded-button">
                        <p className="text-accent-cyan text-sm">
                            <strong>💡 Pro Tip:</strong> The best way to improve your score is through consistent, responsible DeFi participation.
                            Build your on-chain reputation over time through regular protocol interactions and timely repayments.
                        </p>
                    </div>
                </div>

                {/* Tier Comparison */}
                <div className="mt-8 fade-in">
                    <h2 className="text-2xl font-bold text-text-primary mb-6">Tier Comparison</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full bg-bg-card border border-border-secondary rounded-card overflow-hidden">
                            <thead className="bg-bg-secondary">
                                <tr>
                                    <th className="px-6 py-4 text-left text-text-muted font-semibold">Tier</th>
                                    <th className="px-6 py-4 text-left text-text-muted font-semibold">Score Range</th>
                                    <th className="px-6 py-4 text-left text-text-muted font-semibold">Max LTV</th>
                                    <th className="px-6 py-4 text-left text-text-muted font-semibold">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className={`border-t border-border-secondary ${tier === 'Bronze' ? 'bg-tier-bronze/10' : ''}`}>
                                    <td className="px-6 py-4">
                                        <TierBadge tier="Bronze" size="sm" />
                                    </td>
                                    <td className="px-6 py-4 text-text-primary">0 - 9</td>
                                    <td className="px-6 py-4 text-tier-bronze font-bold">50%</td>
                                    <td className="px-6 py-4 text-text-secondary">Standard</td>
                                </tr>
                                <tr className={`border-t border-border-secondary ${tier === 'Silver' ? 'bg-tier-silver/10' : ''}`}>
                                    <td className="px-6 py-4">
                                        <TierBadge tier="Silver" size="sm" />
                                    </td>
                                    <td className="px-6 py-4 text-text-primary">10 - 49</td>
                                    <td className="px-6 py-4 text-tier-silver font-bold">60%</td>
                                    <td className="px-6 py-4 text-text-secondary">Medium</td>
                                </tr>
                                <tr className={`border-t border-border-secondary ${tier === 'Gold' ? 'bg-tier-gold/10' : ''}`}>
                                    <td className="px-6 py-4">
                                        <TierBadge tier="Gold" size="sm" />
                                    </td>
                                    <td className="px-6 py-4 text-text-primary">50 - 100</td>
                                    <td className="px-6 py-4 text-tier-gold font-bold">75%</td>
                                    <td className="px-6 py-4 text-text-secondary">Low</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
