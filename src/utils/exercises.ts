import type { BodyPart } from '../types';

const EXACT_MAPPING: Record<string, BodyPart> = {
    'Squat (Barbell)': 'Legs',
    'Deadlift (Barbell)': 'Legs', // Or Back, but usually Legs/Posterior Chain
    'Leg Press': 'Legs',
    'Hip Thrust (Barbell)': 'Legs',
    'Lying Leg Curl (Machine)': 'Legs',
    'Leg Extension (Machine)': 'Legs',
    'Bench Press (Barbell)': 'Chest',
    'Bench Press (Dumbbell)': 'Chest',
    'Incline Bench Press (Dumbbell)': 'Chest',
    'Chest Press (Machine)': 'Chest',
    'Lat Pulldown (Cable)': 'Back',
    'Lat Pulldown (Machine)': 'Back',
    'Seated Row (Cable)': 'Back',
    'Bent Over Row (Dumbbell)': 'Back',
    'Bent Over One Arm Row (Dumbbell)': 'Back',
    'Pull Up (Assisted)': 'Back',
    'Overhead Press (Barbell)': 'Shoulders',
    'Seated Overhead Press (Dumbbell)': 'Shoulders',
    'Lateral Raise (Dumbbell)': 'Shoulders',
    'Shrug (Dumbbell)': 'Shoulders', // Or Back/Traps
    'Bicep Curl (Cable)': 'Arms',
    'Triceps Pushdown (Cable - Straight Bar)': 'Arms',
    'Stretching': 'Other',
};

const KEYWORD_MAPPING: Record<string, BodyPart> = {
    'Squat': 'Legs',
    'Leg': 'Legs',
    'Calf': 'Legs',
    'Glute': 'Legs',
    'Bench': 'Chest',
    'Chest': 'Chest',
    'Fly': 'Chest',
    'Press': 'Shoulders', // Fallback, could be Chest Press explicitly handled
    'Row': 'Back',
    'Pull': 'Back',
    'Chin': 'Back',
    'Lat': 'Back',
    'Shoulder': 'Shoulders',
    'Raise': 'Shoulders',
    'Curl': 'Arms',
    'Tricep': 'Arms',
    'Bicep': 'Arms',
    'Extension': 'Arms', // Could be Leg Extension, checked before
    'Dip': 'Arms',
    'Pushdown': 'Arms',
    'Abs': 'Core',
    'Crunch': 'Core',
    'Plank': 'Core',
    'Run': 'Cardio',
    'Cycle': 'Cardio',
    'Treadmill': 'Cardio',
};

export const getBodyPart = (exerciseName: string): BodyPart => {
    if (EXACT_MAPPING[exerciseName]) {
        return EXACT_MAPPING[exerciseName];
    }

    for (const [keyword, part] of Object.entries(KEYWORD_MAPPING)) {
        if (exerciseName.includes(keyword)) {
            return part;
        }
    }

    return 'Other';
};
