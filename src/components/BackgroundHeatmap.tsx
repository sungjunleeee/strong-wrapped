import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import type { YearStats } from '../types';
import { generateYearDays, STRONG_BLUE_RGB, getHeatmapOpacity } from '../utils/heatmap';

interface BackgroundHeatmapProps {
    stats: YearStats;
    isVisible: boolean;
}

export const BackgroundHeatmap = React.memo(({ stats, isVisible }: BackgroundHeatmapProps) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const days = useMemo(() => {
        const allDays = generateYearDays(stats.year);

        // Calculate columns to ensure a perfect rectangles
        // 360px (width) - 24px (padding) = 336px available
        // 20px (item) + 3px (gap) = 23px per item approx
        // 336 / 23 = ~14.6 -> 14 columns
        const columns = 14;
        const remainder = allDays.length % columns;

        return allDays.slice(0, allDays.length - remainder);
    }, [stats.year]);

    const STRONG_BLUE = STRONG_BLUE_RGB;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Constants matching previous CSS
        const ITEM_SIZE = 20;
        const GAP = 3;
        const COLUMNS = 14;
        const PADDING = 12; // p-3 = 12px

        // Calculate canvas size based on content
        // Width: (14 * 20) + (13 * 3) + (12 * 2) = 280 + 39 + 24 = 343 (approx fits in 360)
        // We stick to the container size logic
        const contentWidth = (COLUMNS * ITEM_SIZE) + ((COLUMNS - 1) * GAP);
        const rows = Math.ceil(days.length / COLUMNS);
        const contentHeight = (rows * ITEM_SIZE) + ((rows - 1) * GAP);

        // Canvas dimensions (including padding)
        const width = contentWidth + (PADDING * 2);
        const height = contentHeight + (PADDING * 2);

        // Handle High DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        // Text settings for Month labels
        ctx.font = '900 6px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        days.forEach((day, i) => {
            const col = i % COLUMNS;
            const row = Math.floor(i / COLUMNS);

            const x = PADDING + (col * (ITEM_SIZE + GAP));
            const y = PADDING + (row * (ITEM_SIZE + GAP));
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = stats.workoutsByDate[dateStr] || 0;

            // Determine opacity based on count
            const alpha = getHeatmapOpacity(count);

            // Draw rounded rect (simplified as normal rect for canvas speed, or customized path)
            ctx.fillStyle = `rgba(${STRONG_BLUE}, ${alpha})`;

            // Rounded rectangle helper
            const radius = 6; // rounded-md approx 6px
            ctx.beginPath();
            ctx.roundRect(x, y, ITEM_SIZE, ITEM_SIZE, radius);
            ctx.fill();

            // Draw Month Label
            if (day.getDate() === 1) {
                const monthText = format(day, 'MMM').toUpperCase();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillText(monthText, x + (ITEM_SIZE / 2), y + (ITEM_SIZE / 2));
            }
        });

    }, [days, stats.workoutsByDate]);

    const containerVariants = {
        hidden: {
            opacity: 0,
            transition: { duration: 0.2 }
        },
        visible: {
            opacity: 1,
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center p-3"
        >
            <canvas ref={canvasRef} />
        </motion.div>
    );
});
