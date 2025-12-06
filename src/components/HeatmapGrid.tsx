
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { eachDayOfInterval, format, startOfYear, endOfYear } from 'date-fns';
import type { YearStats } from '../types';

interface HeatmapGridProps {
    stats: YearStats;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({ stats }) => {
    const days = useMemo(() => {
        const year = stats.year;
        return eachDayOfInterval({
            start: startOfYear(new Date(year, 0, 1)),
            end: endOfYear(new Date(year, 0, 1))
        });
    }, [stats.year]);

    const STRONG_BLUE = '46, 164, 247'; // #2ea4f7 RGB

    const getColorStyle = (count: number) => {
        if (count === 0) return { backgroundColor: `rgba(${STRONG_BLUE}, 0.1)` };
        if (count === 1) return { backgroundColor: `rgba(${STRONG_BLUE}, 0.3)` };
        if (count === 2) return { backgroundColor: `rgba(${STRONG_BLUE}, 0.6)` };
        if (count >= 3) return { backgroundColor: `rgba(${STRONG_BLUE}, 0.9)` };
        return { backgroundColor: `rgba(${STRONG_BLUE}, 0.1)` };
    };

    return (
        <div className="flex flex-wrap gap-[2px] w-[280px] content-start">
            {days.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const count = stats.workoutsByDate[dateStr] || 0;

                return (
                    <motion.div
                        key={day.toISOString()}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.002, duration: 0.1 }}
                        className="w-[11px] h-[11px] rounded-[2px]"
                        title={`${dateStr}: ${count} workouts`}
                        style={getColorStyle(count)}
                    />
                );
            })}
        </div>
    );
};
