'use client';

import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn, getTierFromScore, getTierColor, type Tier } from '@/lib/utils';

interface ScoreMeterProps {
    score: number;
    tier: Tier;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Animated circular progress ring showing FairScore
 * Animates from 0 to score when visible in viewport
 */
export default function ScoreMeter({ score, tier, size = 'md', className }: ScoreMeterProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    // Size configurations
    const sizeConfig = {
        sm: { width: 120, stroke: 8, fontSize: 'text-2xl' },
        md: { width: 200, stroke: 12, fontSize: 'text-4xl' },
        lg: { width: 280, stroke: 16, fontSize: 'text-6xl' },
    };

    const config = sizeConfig[size];
    const radius = (config.width - config.stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    // Animate score when component comes into view
    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => {
                setAnimatedScore(score);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [score, isInView]);

    const tierColorClass = getTierColor(tier);

    return (
        <div ref={ref} className={cn('flex items-center justify-center', className)}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative"
                style={{ width: config.width, height: config.width }}
            >
                {/* Background circle */}
                <svg
                    className="transform -rotate-90"
                    width={config.width}
                    height={config.width}
                >
                    <circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={config.stroke}
                        fill="none"
                        className="text-border-primary"
                    />
                    {/* Animated progress circle */}
                    <motion.circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={config.stroke}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={cn('transition-all duration-1000 ease-out', `text-${tierColorClass}`)}
                        style={{
                            filter: `drop-shadow(0 0 8px var(--${tierColorClass}))`,
                        }}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                    />
                </svg>

                {/* Score text with count-up animation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 200 }}
                        className={cn('font-bold', config.fontSize, `text-${tierColorClass}`)}
                    >
                        {Math.round(animatedScore)}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="text-text-muted text-sm mt-1"
                    >
                        FairScore
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
