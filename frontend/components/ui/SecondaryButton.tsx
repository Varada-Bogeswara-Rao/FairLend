'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SecondaryButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

/**
 * Secondary button with ghost style, border hover, and press animation
 */
export default function SecondaryButton({
    onClick,
    disabled = false,
    children,
    className,
    type = 'button',
}: SecondaryButtonProps) {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02, borderColor: '#06b6d4' } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
                'px-6 py-3 rounded-button font-semibold text-base',
                'bg-transparent text-text-primary border-2 border-border-primary',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                !disabled && 'hover:border-accent-cyan hover:text-accent-cyan hover:shadow-glow-cyan',
                className
            )}
        >
            {children}
        </motion.button>
    );
}
