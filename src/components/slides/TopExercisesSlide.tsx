import React from 'react';
import type { YearStats } from '../../types';
import { motion } from 'framer-motion';
import { GlassCard } from '../GlassCard';

interface TopExercisesSlideProps {
    stats: YearStats;
}

export const TopExercisesSlide: React.FC<TopExercisesSlideProps> = ({ stats }) => {
    const top5 = stats.topExercises;

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4">
            <GlassCard>
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-3xl font-black text-white text-center mb-8 drop-shadow-lg uppercase"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">Top Moves</span>
                </motion.h2>

                <div className="w-full space-y-3 flex-1 overflow-y-auto">
                    {top5.map((ex, index) => (
                        <motion.div
                            key={ex.name}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl relative overflow-hidden ring-1 ring-white/5"
                        >
                            {/* Progress bar background */}
                            <div className="absolute left-0 top-0 bottom-0 bg-blue-500/20 mix-blend-overlay" style={{ width: `${(ex.count / top5[0].count) * 100}%` }} />

                            <div className="flex items-center gap-4 z-10">
                                <span className="text-xl font-bold text-blue-400/50 font-mono">#{index + 1}</span>
                                <span className="font-bold text-white truncate max-w-[160px] drop-shadow-sm">{ex.name}</span>
                            </div>
                            <span className="text-blue-100 font-mono z-10 text-sm">{ex.count}</span>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};
