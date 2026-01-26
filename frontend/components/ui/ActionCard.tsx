'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ActionCardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

/**
 * Glassmorphic card container with hover animation
 */
export default function ActionCard({ title, icon, children, className }: ActionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)' }}
            className={cn(
                'bg-white/5 border border-white/10 rounded-xl p-6',
                'space-y-4',
                className
            )}
        >
            {/* Card Header */}
            <div className="flex items-center gap-3">
                {icon && <div className="text-accent-emerald text-2xl">{icon}</div>}
                <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
            </div>

            {/* Card Content */}
            <div className="space-y-4">{children}</div>
        </motion.div>
    );
}
