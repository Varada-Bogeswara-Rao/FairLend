'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PrimaryButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

/**
 * Primary button with solid background, glow effect, and press animation
 */
export default function PrimaryButton({
    onClick,
    disabled = false,
    loading = false,
    children,
    className,
    type = 'button',
}: PrimaryButtonProps) {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            whileHover={!disabled && !loading ? { scale: 1.02, boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)' } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
                'button-shimmer px-6 py-3 rounded-button font-semibold text-base',
                'bg-accent-emerald text-white',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                !disabled && !loading && 'hover:bg-accent-emerald/90 hover:shadow-glow-emerald',
                loading && 'cursor-wait',
                className
            )}
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                    <span>Processing...</span>
                </div>
            ) : (
                children
            )}
        </motion.button>
    );
}
