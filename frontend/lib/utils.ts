/**
 * Utility functions for FairLend
 */

// Combine class names conditionally
export function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}

// Tier type definition
export type Tier = 'Bronze' | 'Silver' | 'Gold';

/**
 * Get tier from FairScore
 * Bronze: 0-9
 * Silver: 10-49
 * Gold: 50-100
 */
export function getTierFromScore(score: number): Tier {
    if (score >= 50) return 'Gold';
    if (score >= 10) return 'Silver';
    return 'Bronze';
}

/**
 * Get max LTV percentage for a tier
 * Bronze: 50%
 * Silver: 60%
 * Gold: 75%
 */
export function getLTVForTier(tier: Tier): number {
    switch (tier) {
        case 'Gold':
            return 0.75;
        case 'Silver':
            return 0.60;
        case 'Bronze':
            return 0.50;
        default:
            return 0.50;
    }
}

/**
 * Calculate maximum borrowable amount based on collateral and tier
 */
export function calculateMaxBorrow(collateral: number, tier: Tier): number {
    const ltv = getLTVForTier(tier);
    return collateral * ltv;
}

/**
 * Shorten wallet address for display
 * Example: 7x8H...9KpL
 */
export function shortenWalletAddress(address: string, chars = 4): string {
    if (!address) return '';
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Get tier color class
 */
export function getTierColor(tier: Tier): string {
    switch (tier) {
        case 'Gold':
            return 'tier-gold';
        case 'Silver':
            return 'tier-silver';
        case 'Bronze':
            return 'tier-bronze';
        default:
            return 'tier-bronze';
    }
}

/**
 * Get tier background class
 */
export function getTierBgClass(tier: Tier): string {
    switch (tier) {
        case 'Gold':
            return 'bg-tier-gold/10 border-tier-gold';
        case 'Silver':
            return 'bg-tier-silver/10 border-tier-silver';
        case 'Bronze':
            return 'bg-tier-bronze/10 border-tier-bronze';
        default:
            return 'bg-tier-bronze/10 border-tier-bronze';
    }
}

/**
 * Format number with commas
 */
export function formatNumber(num: number, decimals = 2): string {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}
