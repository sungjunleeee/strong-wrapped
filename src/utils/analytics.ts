import type { WorkoutSession, YearStats } from '../types';
import { getBodyPart } from './exercises';
import type { BodyPart } from '../types';
import { format } from 'date-fns';



export const calculateYearStats = (sessions: WorkoutSession[], year: number = 2025, units: 'kg' | 'lbs' = 'lbs'): YearStats => {
    // Filter by year
    const targetSessions = sessions.filter(s => s.date.getFullYear() === year);

    let totalDuration = 0;
    let totalVolume = 0;
    const exerciseCounts = new Map<string, number>();
    const bodyPartCounts = new Map<BodyPart, number>();
    const monthlyCounts = new Map<string, number>();
    const workoutsByDate: Record<string, number> = {};

    let heaviestLift = { name: '', weight: 0, date: new Date() };

    targetSessions.forEach(session => {
        // Parse duration
        // Access durationMinutes directly as it is now number in WorkoutSession
        totalDuration += session.durationMinutes;

        // Monthly stats
        const month = format(session.date, 'MMMM');
        monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1);

        // Heatmap
        const dateKey = format(session.date, 'yyyy-MM-dd');
        workoutsByDate[dateKey] = (workoutsByDate[dateKey] || 0) + 1;

        session.sets.forEach(set => {
            // Volume
            // Exclude warmups? Logic: If order is 1,2,3... usually work sets. 'W' is warmup.
            // Strong export: 'Set Order' can be 'W'.
            // Note: parser stores order as number. If it was 'W', parser stored 0.
            // Let's exclude 0 (warmup) from Volume if we want "Effective Volume", but usually Volume includes everything?
            // Let's include everything for "Total Volume" bragging rights, or maybe filter W.
            // User prompt doesn't specify. 'W' usually means warmup.
            // Let's count everything for now but note distinct heaviest if it's not warmup.

            if (set.weight > 0 && set.reps > 0) {
                totalVolume += set.weight * set.reps;
            }

            // Heaviest Lift (Max Weight)
            if (set.weight > heaviestLift.weight) {
                heaviestLift = { name: set.exerciseName, weight: set.weight, date: session.date };
            }

            // Exercise Counts (Frequency)
            // Count unique exercises per session? Or total sets?
            // "How often/reps we did certain workout" -> Usually counting "Sessions containing this exercise".
        });

        // Count unique exercises in this session
        const uniqueExercises = new Set(session.sets.map(s => s.exerciseName));
        uniqueExercises.forEach(name => {
            exerciseCounts.set(name, (exerciseCounts.get(name) || 0) + 1);

            const part = getBodyPart(name);
            bodyPartCounts.set(part, (bodyPartCounts.get(part) || 0) + 1);
        });
    });

    // Top Exercises
    const sortedExercises = Array.from(exerciseCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Body Part Split
    // Convert map to Record
    const bodyPartSplit: Record<BodyPart, number> = {
        Legs: 0, Chest: 0, Back: 0, Shoulders: 0, Arms: 0, Core: 0, Cardio: 0, Other: 0
    };
    bodyPartCounts.forEach((count, part) => {
        bodyPartSplit[part] = count;
    });

    // Most Active Month
    let mostActiveMonth = '';
    let maxMonthCount = 0;
    monthlyCounts.forEach((count, month) => {
        if (count > maxMonthCount) {
            maxMonthCount = count;
            mostActiveMonth = month;
        }
    });

    // Active Months (for heatmap or similar, just the counts per month)
    const activeMonths: Record<string, number> = {};
    monthlyCounts.forEach((count, month) => {
        activeMonths[month] = count;
    });

    const totalWorkouts = targetSessions.length;

    return {
        totalWorkouts,
        totalDurationMinutes: totalDuration,
        totalVolume: Math.round(totalVolume),
        topExercises: sortedExercises,
        bodyPartSplit,
        activeMonths,
        heaviestLift: {
            name: heaviestLift.name,
            weight: heaviestLift.weight
        },
        workoutsByDate,
        mostActiveMonth,
        year,
        units
    };
};
