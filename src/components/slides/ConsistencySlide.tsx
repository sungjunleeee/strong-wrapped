import React from 'react';
import type { YearStats } from '../../types';
import { motion } from 'framer-motion';
import { HeatmapGrid } from '../HeatmapGrid';
import { GlassCard } from '../GlassCard';

interface ConsistencySlideProps {
    stats: YearStats;
}

export const ConsistencySlide: React.FC<ConsistencySlideProps> = ({ stats }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4">
            <GlassCard>
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-3xl font-black text-white text-center mb-8 drop-shadow-lg uppercase"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">Consistency</span>
                </motion.h2>

                <div className="flex flex-col gap-6 items-center flex-1 justify-center">
                    <div className="text-lg text-blue-200/60 font-medium tracking-wide">
                        Most active in <span className="text-white font-bold text-xl drop-shadow-md block text-center mt-1">{stats.mostActiveMonth}</span>
                    </div>

                    <div className="relative p-2 bg-slate-900/40 rounded-xl ring-1 ring-white/5 backdrop-blur-sm">
                        <HeatmapGrid stats={stats} />
                    </div>

                    <div className="flex justify-between w-full max-w-[280px] text-[10px] text-blue-200/40 font-mono uppercase tracking-widest px-2">
                        <span>Jan</span>
                        <span>Dec</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
