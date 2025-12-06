export type BodyPart = 'Legs' | 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio' | 'Other';

export interface RawStrongWorkout {
    Date: string;
    'Workout Name': string;
    Duration: string;
    'Exercise Name': string;
    'Set Order': string;
    Weight: number;
    Reps: number;
    Distance: number;
    Seconds: number;
    Notes: string;
    'Workout Notes': string;
    RPE: string;
}

export interface WorkoutSet {
    exerciseName: string;
    order: number;
    weight: number;
    reps: number;
    distance: number;
    seconds: number;
    notes: string;
    rpe: number;
    bodyPart: BodyPart;
}

export interface WorkoutSession {
    date: Date;
    id: string; // Unique ID (date + name?)
    name: string;
    durationMinutes: number;
    notes: string;
    sets: WorkoutSet[];
}

export interface YearStats {
    totalWorkouts: number;
    totalDurationMinutes: number;
    totalVolume: number; // kg
    topExercises: { name: string; count: number }[];
    bodyPartSplit: Record<BodyPart, number>;
    activeMonths: Record<string, number>; // "Jan": 5
    heaviestLift: { name: string; weight: number };
    workoutsByDate: Record<string, number>; // "2024-01-01": 1
    mostActiveMonth: string;
    year: number;
    units: 'kg' | 'lbs';
}
