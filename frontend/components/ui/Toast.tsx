'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onDismiss: () => void;
    duration?: number;
}

/**
 * Toast notification with slide-in animation from bottom-right
 */
export default function Toast({ message, type, onDismiss, duration = 5000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    const typeStyles = {
        success: 'bg-accent-emerald/20 border-accent-emerald text-accent-emerald',
        error: 'bg-error-red/20 border-error-red text-error-red',
        warning: 'bg-warning-amber/20 border-warning-amber text-warning-amber',
        info: 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan',
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 100, y: 100 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                    'fixed bottom-4 right-4 z-50',
                    'flex items-center gap-3 px-4 py-3 rounded-button border-2',
                    'min-w-[300px] max-w-md',
                    'backdrop-blur-md shadow-lg',
                    typeStyles[type]
                )}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="text-xl font-bold"
                >
                    {icons[type]}
                </motion.div>
                <p className="flex-1 font-medium">{message}</p>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onDismiss}
                    className="text-current hover:opacity-70 transition-opacity"
                    aria-label="Dismiss"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </motion.button>
            </motion.div>
        </AnimatePresence>
    );
}
