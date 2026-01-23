import { FC } from 'react';
import { getTierName } from '@/lib/attestation';

interface TrustBadgeProps {
    score: number;
    tier: number;
    loading?: boolean;
}

export const TrustBadge: FC<TrustBadgeProps> = ({ score, tier, loading }) => {
    const tierName = getTierName(tier);

    // Premium Gradients based on tier
    const tierStyle =
        tier === 3 ? "bg-gradient-to-br from-yellow-500/20 to-amber-700/20 border-yellow-500/30 text-yellow-100" :
            tier === 2 ? "bg-gradient-to-br from-slate-400/20 to-slate-600/20 border-slate-400/30 text-slate-100" :
                "bg-gradient-to-br from-orange-800/20 to-red-900/20 border-orange-700/30 text-orange-100";

    const tierIcon =
        tier === 3 ? "🏆" :
            tier === 2 ? "🥈" :
                "🥉";

    // Score Progress
    const progress = Math.min(100, Math.max(0, score));

    if (loading) {
        return <div className="animate-pulse glass-panel h-48 w-full rounded-2xl"></div>;
    }

    return (
        <div className={`p-8 rounded-2xl border ${tierStyle} backdrop-blur-md shadow-2xl transition-all duration-300 hover:shadow-blue-500/10`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{tierIcon}</span>
                        <h3 className="text-2xl font-bold uppercase tracking-widest">{tierName}</h3>
                    </div>
                    <p className="text-sm opacity-70 font-medium tracking-wide">FAIRSCORE REPUTATION</p>
                </div>
                <div className="text-5xl font-black tracking-tight">{score}</div>
            </div>

            {/* Premium Progress Bar */}
            <div className="w-full bg-black/40 rounded-full h-3 mt-4 overflow-hidden border border-white/5">
                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="mt-6 flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                <div className={`w-2 h-2 rounded-full ${tier >= 2 ? "bg-green-400 shadow-[0_0_5px_lime]" : "bg-red-400"}`}></div>
                <div className="text-xs font-medium opacity-90">
                    {tier === 3 ? "MAX LTV UNLOCKED (85%)" :
                        tier === 2 ? "STANDARD LTV UNLOCKED (70%)" :
                            "BORROWING RESTRICTED"}
                </div>
            </div>
        </div>
    );
};
