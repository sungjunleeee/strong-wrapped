import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { YearStats } from '../types';
import { generateYearDays, getGridColorStyle } from '../utils/heatmap';

interface HeatmapGridProps {
    stats: YearStats;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ stats }) => {
    const days = useMemo(() => {
        return generateYearDays(stats.year);
    }, [stats.year]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-[2px] w-[280px] content-start"
        >
            {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const count = stats.workoutsByDate[dateStr] || 0;

                return (
                    <div
                        key={day.toISOString()}
                        className="w-[11px] h-[11px] rounded-[2px] transition-opacity duration-300 hover:opacity-80"
                        title={`${dateStr}: ${count} workouts`}
                        style={getGridColorStyle(count)}
                    />
                );
            })}
        </motion.div>
    );
};
