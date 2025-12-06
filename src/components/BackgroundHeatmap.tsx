import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { eachDayOfInterval, format, startOfYear, endOfYear } from 'date-fns';

import type { YearStats } from '../types';

interface BackgroundHeatmapProps {
    stats: YearStats;
}

export const BackgroundHeatmap: React.FC<BackgroundHeatmapProps> = ({ stats }) => {
    const days = useMemo(() => {
        const year = stats.year;
        const allDays = eachDayOfInterval({
            start: startOfYear(new Date(year, 0, 1)),
            end: endOfYear(new Date(year, 0, 1))
        });

        // Calculate columns to ensure a perfect rectangles
        // 360px (width) - 24px (padding) = 336px available
        // 20px (item) + 3px (gap) = 23px per item approx
        // 336 / 23 = ~14.6 -> 14 columns
        const columns = 14;
        const remainder = allDays.length % columns;

        // Remove the remainder days to keep the grid perfectly rectangular
        // This usually drops Dec 31st (and 30th on leap years)
        return allDays.slice(0, allDays.length - remainder);
    }, [stats.year]);

    const STRONG_BLUE = '46, 164, 247'; // #2ea4f7 RGB

    const getColorStyle = (dateStr: string) => {
        const count = stats.workoutsByDate[dateStr] || 0;

        // Base color is the Strong Blue
        // We vary alpha channel for intensity
        // Lowered alphas since parent opacity is removed to allow text visibility
        if (count === 0) return { backgroundColor: `rgba(${STRONG_BLUE}, 0.05)` };
        if (count === 1) return { backgroundColor: `rgba(${STRONG_BLUE}, 0.15)` };
        if (count === 2) return { backgroundColor: `rgba(${STRONG_BLUE}, 0.3)` };
        if (count >= 3) return { backgroundColor: `rgba(${STRONG_BLUE}, 0.5)` };
        return { backgroundColor: `rgba(${STRONG_BLUE}, 0.05)` };
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.001,
                delayChildren: 0
            }
        },
        exit: {
            opacity: 0,
            transition: {
                staggerChildren: 0.001,
                staggerDirection: -1,
                when: "afterChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 z-0 overflow-hidden flex flex-wrap justify-center content-center gap-[3px] p-3"
        >
            {days.map((day) => {
                const isFirstDay = day.getDate() === 1;
                return (
                    <motion.div
                        key={day.toISOString()}
                        variants={itemVariants}
                        className="w-[20px] h-[20px] rounded-md relative flex items-center justify-center pointer-events-none"
                        style={getColorStyle(format(day, 'yyyy-MM-dd'))}
                    >
                        {isFirstDay && (
                            <span className="text-[6px] font-black text-white/50 tracking-tighter shadow-sm select-none">
                                {format(day, 'MMM').toUpperCase()}
                            </span>
                        )}
                    </motion.div>
                );
            })}
        </motion.div>
    );
};
