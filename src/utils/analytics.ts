import type { WorkoutSession, YearStats } from '../types';
import { getBodyPart } from './exercises';
import type { BodyPart } from '../types';
import { format, startOfWeek } from 'date-fns';



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
    let longestWorkout = { durationMinutes: 0, date: new Date(), name: '' };
    // Track most reps (highest rep count in a single set)
    let mostRepsSet = { weight: 0, reps: 0, exerciseName: '', date: new Date() };

    targetSessions.forEach(session => {
        // Parse duration
        // Access durationMinutes directly as it is now number in WorkoutSession
        totalDuration += session.durationMinutes;

        // Longest Workout
        if (session.durationMinutes > longestWorkout.durationMinutes) {
            longestWorkout = {
                durationMinutes: session.durationMinutes,
                date: session.date,
                name: session.name
            };
        }

        // Monthly stats
        const month = format(session.date, 'MMMM');
        monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1);

        // Heatmap
        const dateKey = format(session.date, 'yyyy-MM-dd');
        workoutsByDate[dateKey] = (workoutsByDate[dateKey] || 0) + 1;

        session.sets.forEach(set => {
            // Volume
            if (set.weight > 0 && set.reps > 0) {
                totalVolume += set.weight * set.reps;
            }

            // Heaviest Lift (Max Weight)
            if (set.weight > heaviestLift.weight) {
                heaviestLift = { name: set.exerciseName, weight: set.weight, date: session.date };
            }

            // Most Reps
            // We want the set with the highest reps.
            // If reps are tied, maybe prefer higher weight?
            if (set.reps > mostRepsSet.reps) {
                mostRepsSet = {
                    weight: set.weight,
                    reps: set.reps,
                    exerciseName: set.exerciseName,
                    date: session.date
                };
            } else if (set.reps === mostRepsSet.reps) {
                if (set.weight > mostRepsSet.weight) {
                    mostRepsSet = {
                        weight: set.weight,
                        reps: set.reps,
                        exerciseName: set.exerciseName,
                        date: session.date
                    };
                }
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

    // Longest Streak Calculation (Days)
    // Sort all unique workout dates


    // Existing daily streak logic (keeping it just in case, but we will return week streak)
    // ... (omitted for brevity, assume replaced logic)

    // Calculate Weekly Streak
    // Get unique "Week Starts"
    // Using ISO week or standard week? Let's use start of week (Monday or Sunday).
    // Let's use ISO week string "yyyy-Www" or just start date of week







    // Weekly Streak: Convert all dates to "Start of Week" timestamp
    const startOfWeeks = Array.from(new Set(targetSessions.map(s => {
        // Use date-fns for reliable matching (Monday start)
        return startOfWeek(s.date, { weekStartsOn: 1 }).getTime();
    }))).sort((a, b) => a - b);

    let maxWeeks = 0;
    let currWeeks = 0;
    let maxWeeksStartDate = new Date(); // Start of the streak

    // Capture the start of the current streak
    let currWeeksStartDate = new Date(startOfWeeks[0] || Date.now());

    for (let i = 0; i < startOfWeeks.length; i++) {
        const current = startOfWeeks[i];

        if (i === 0) {
            currWeeks = 1;
            currWeeksStartDate = new Date(current);
        } else {
            const prev = startOfWeeks[i - 1];
            const diffTime = current - prev;
            const OneWeekMs = 7 * 24 * 60 * 60 * 1000;
            // Allow some wiggle room for daylight savings (approx 1 week)
            // 7 days +/- 1 hour

            if (diffTime <= OneWeekMs + 3600000 * 2 && diffTime >= OneWeekMs - 3600000 * 2) {
                currWeeks++;
            } else {
                currWeeks = 1;
                currWeeksStartDate = new Date(current);
            }
        }

        if (currWeeks > maxWeeks) {
            maxWeeks = currWeeks;
            maxWeeksStartDate = currWeeksStartDate;
        }
    }


    const totalWorkouts = targetSessions.length;

    return {
        totalWorkouts,
        totalDurationMinutes: totalDuration,
        totalVolume: Math.round(totalVolume),
        topExercises: sortedExercises,
        bodyPartSplit,
        activeMonths,
        heaviestLift,
        longestWorkout,
        longestStreak: {
            days: 0, // Deprecated or calculate daily streak if needed, but user wants weeks. Setting to 0 to satisfy type for now.
            startDate: new Date(),
            endDate: new Date()
        },
        longestWeekStreak: {
            weeks: maxWeeks,
            startDate: maxWeeksStartDate,
            endDate: new Date(maxWeeksStartDate.getTime() + (maxWeeks * 7 * 24 * 60 * 60 * 1000)) // Approx end date
        },
        mostRepsSet,
        workoutsByDate,
        mostActiveMonth,
        year,
        units
    };
};
