import React from 'react';
import { cn, getTierBgClass, type Tier } from '@/lib/utils';

interface TierBadgeProps {
    tier: Tier;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Visual badge component for Bronze/Silver/Gold tiers
 */
export default function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
    const sizeClasses = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const tierEmoji = {
        Bronze: '🥉',
        Silver: '🥈',
        Gold: '🥇',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 rounded-full border-2 font-semibold',
                getTierBgClass(tier),
                sizeClasses[size],
                className
            )}
        >
            <span className="text-lg">{tierEmoji[tier]}</span>
            <span>{tier} Tier</span>
        </div>
    );
}
