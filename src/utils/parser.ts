import Papa from 'papaparse';
import { getBodyPart } from './exercises';
import type { RawStrongWorkout, WorkoutSession } from '../types';

// Helper to parse "1h 30m" to minutes
const parseDuration = (durationStr: string): number => {
    if (!durationStr) return 0;
    let minutes = 0;
    const hoursMatch = durationStr.match(/(\d+)h/);
    const minutesMatch = durationStr.match(/(\d+)m/);
    if (hoursMatch) minutes += parseInt(hoursMatch[1]) * 60;
    if (minutesMatch) minutes += parseInt(minutesMatch[1]);
    return minutes;
};

export const parseStrongCSV = (csvText: string): Promise<RawStrongWorkout[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length) {
                    console.warn("CSV Errors:", results.errors);
                }
                resolve(results.data as RawStrongWorkout[]);
            },
            error: (error: Error) => reject(error),
        });
    });
};

export const processWorkouts = (rawData: RawStrongWorkout[]): WorkoutSession[] => {
    const sessions = new Map<string, WorkoutSession>();

    rawData.forEach((row) => {
        if (!row.Date || !row['Workout Name']) return;

        // Create a unique key for the session based on date and name
        // Assuming format "2024-05-08 21:38:05" - this is unique enough
        const sessionKey = `${row.Date}-${row['Workout Name']}`;

        if (!sessions.has(sessionKey)) {
            sessions.set(sessionKey, {
                id: sessionKey,
                date: new Date(row.Date),
                name: row['Workout Name'],
                durationMinutes: parseDuration(row.Duration),
                notes: row['Workout Notes'] || '',
                sets: [],
            });
        }

        const session = sessions.get(sessionKey)!;

        // Parse order. "1", "2", "W", "D" (warmup, dropset?)
        // Storing purely as is or converting? 
        // Usually Strong uses 1, 2, 3 for working sets.
        // We'll keep it simple for now but might want to flag warmup.

        session.sets.push({
            exerciseName: row['Exercise Name'],
            weight: Number(row.Weight || 0),
            reps: Number(row.Reps || 0),
            distance: Number(row.Distance || 0),
            seconds: Number(row.Seconds || 0),
            notes: row.Notes || '',
            rpe: isNaN(Number(row.RPE)) ? 0 : Number(row.RPE),
            order: isNaN(Number(row['Set Order'])) ? 0 : Number(row['Set Order']), // 0 for warmup/failure/drop?
            bodyPart: getBodyPart(row['Exercise Name']),
        });
    });

    // Sort sessions by date
    return Array.from(sessions.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
};
