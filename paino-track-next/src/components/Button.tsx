'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    children: React.ReactNode;
}

export default function Button({ children, onClick, variant = 'primary', className, loading = false, ...props }: ButtonProps) {
    const baseStyles = "relative px-6 py-3 rounded-xl font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-primary/50",
        secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md",
        outline: "bg-transparent text-primary border border-primary/30 hover:bg-primary/10"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(baseStyles, variants[variant], className)}
            onClick={onClick}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <span className="relative z-10">{children}</span>
                    {variant === 'primary' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                    )}
                </>
            )}
        </motion.button>
    );
}
