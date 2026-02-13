'use client';

import { motion } from 'framer-motion';

export default function ProgressBar({ progress, color }: { progress: number, color?: string }) {
    return (
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className={`h-full relative shadow-[0_0_15px_rgba(59,130,246,0.6)] ${color || 'bg-primary'}`}
            >
                <div className="absolute top-0 right-0 h-full w-4 bg-white/50 blur-sm" />
            </motion.div>
        </div>
    );
}
