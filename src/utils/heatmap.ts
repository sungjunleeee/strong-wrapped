import { eachDayOfInterval, startOfYear, endOfYear } from 'date-fns';

export const STRONG_BLUE_RGB = '46, 164, 247'; // #2ea4f7

export const generateYearDays = (year: number) => {
    return eachDayOfInterval({
        start: startOfYear(new Date(year, 0, 1)),
        end: endOfYear(new Date(year, 0, 1))
    });
};

export const getHeatmapColor = (count: number, opacityMultiplier = 1) => {
    let alpha = 0.05;
    if (count === 1) alpha = 0.15;
    else if (count === 2) alpha = 0.3;
    else if (count >= 3) alpha = 0.5;

    // Allow higher opacity for non-background uses if needed, or stick to this scale
    // If we want the stronger colors from HeatmapGrid:
    // Grid was: 0->0.1, 1->0.3, 2->0.6, 3->0.9
    // Background was: 0->0.05, 1->0.15, 2->0.3, 3->0.5

    // We can parameterize this or have two scales.
    // Let's stick to a unified scale or allow passing a strictly higher opacity for the foreground grid.

    return `rgba(${STRONG_BLUE_RGB}, ${alpha * opacityMultiplier})`;
};

export const getHeatmapOpacity = (count: number): number => {
    if (count === 0) return 0.05;
    if (count === 1) return 0.15;
    if (count === 2) return 0.3;
    if (count >= 3) return 0.5;
    return 0.05;
}

export const getGridColorStyle = (count: number) => {
    // Logic from HeatmapGrid (slightly more vivid)
    if (count === 0) return { backgroundColor: `rgba(${STRONG_BLUE_RGB}, 0.1)` };
    if (count === 1) return { backgroundColor: `rgba(${STRONG_BLUE_RGB}, 0.3)` };
    if (count === 2) return { backgroundColor: `rgba(${STRONG_BLUE_RGB}, 0.6)` };
    if (count >= 3) return { backgroundColor: `rgba(${STRONG_BLUE_RGB}, 0.9)` };
    return { backgroundColor: `rgba(${STRONG_BLUE_RGB}, 0.1)` };
};
