'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export default function GlassCard({ children, className, hoverEffect = false }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "glass rounded-2xl p-8 border border-white/5 relative overflow-hidden",
                hoverEffect && "hover:bg-white/10 hover:border-white/20 transition-all duration-300",
                className
            )}
        >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
            {children}
        </motion.div>
    );
}
