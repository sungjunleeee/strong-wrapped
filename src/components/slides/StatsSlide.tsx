import React from 'react';
import type { YearStats } from '../../types';
import { motion } from 'framer-motion';
import { GlassCard } from '../GlassCard';

interface StatsSlideProps {
    stats: YearStats;
}

const StatItem: React.FC<{ label: string; value: string | number; delay?: number }> = ({ label, value, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-slate-900/40 p-4 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner ring-1 ring-white/5 w-full flex flex-col justify-center"
    >
        <div className="text-blue-200/60 text-xs uppercase tracking-widest font-bold mb-1">{label}</div>
        <div className="text-3xl font-bold text-white drop-shadow-sm">{value}</div>
    </motion.div>
);

export const StatsSlide: React.FC<StatsSlideProps> = ({ stats }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4">
            <GlassCard>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black text-white text-center mb-8 drop-shadow-lg"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">THE GRIND</span>
                </motion.h2>

                <div className="space-y-3 flex-1 flex flex-col justify-center">
                    <StatItem label="Total Workouts" value={stats.totalWorkouts} delay={0.1} />
                    <StatItem label="Total Time" value={`${Math.round(stats.totalDurationMinutes / 60)} Hours`} delay={0.2} />
                    <StatItem label="Total Volume" value={`${(stats.totalVolume / 1000).toFixed(1)}k ${stats.units}`} delay={0.3} />
                    <StatItem
                        label="Heaviest Lift"
                        value={`${stats.heaviestLift.name} @ ${stats.heaviestLift.weight}`}
                        delay={0.4}
                    />
                </div>
            </GlassCard>
        </div>
    );
};
