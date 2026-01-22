import { FC } from 'react';
import { getTierName } from '@/lib/attestation';

interface TrustBadgeProps {
    score: number;
    tier: number;
    loading?: boolean;
}

export const TrustBadge: FC<TrustBadgeProps> = ({ score, tier, loading }) => {
    const tierName = getTierName(tier);

    // Colors based on tier
    const tierColor =
        tier === 3 ? "bg-yellow-500 text-black border-yellow-300" :
            tier === 2 ? "bg-gray-300 text-black border-gray-100" :
                "bg-orange-700 text-white border-orange-900";

    // Score Progress (simple visual)
    const progress = Math.min(100, Math.max(0, score));

    if (loading) {
        return <div className="animate-pulse bg-gray-700 h-24 w-full rounded-xl"></div>;
    }

    return (
        <div className={`p-6 rounded-xl border-2 ${tierColor} shadow-lg transition-all duration-300 transform hover:scale-105`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider">{tierName} Tier</h3>
                    <p className="text-sm opacity-80">FairScore Reputation</p>
                </div>
                <div className="text-3xl font-black">{score}</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/20 rounded-full h-2.5 mt-2">
                <div
                    className="bg-current h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="mt-3 text-xs font-semibold">
                {tier === 3 ? "Unlocks Maximum Borrow Limits (85% LTV)" :
                    tier === 2 ? "Unlocks Standard Borrowing (70% LTV)" :
                        "Borrowing Restricted / Low Limits"}
            </div>
        </div>
    );
};
