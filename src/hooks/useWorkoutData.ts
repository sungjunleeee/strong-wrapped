import { useState } from 'react';
import { parseStrongCSV, processWorkouts } from '../utils/parser';
import { calculateYearStats } from '../utils/analytics';
import type { YearStats } from '../types';

export const useWorkoutData = () => {
    const [loading, setLoading] = useState(false); // Default false, strictly waiting for input
    const [stats, setStats] = useState<YearStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rawCSV, setRawCSV] = useState<string | null>(null);

    const loadCSV = async (csvText: string, year: number = 2025, units: 'kg' | 'lbs' = 'lbs') => {
        setLoading(true);
        setError(null);
        setRawCSV(null);
        try {
            // Store raw text for bug reporting
            setRawCSV(csvText);

            const rawData = await parseStrongCSV(csvText);
            const sessions = processWorkouts(rawData);

            // Calculate stats for target year
            const yearStats = calculateYearStats(sessions, year, units);
            setStats(yearStats);
            console.log('Parsed Stats:', yearStats);
        } catch (err) {
            console.error(err);
            setError('Failed to parse CSV data. Please check the file format.');
        } finally {
            setLoading(false);
        }
    };

    return { loading, stats, error, loadCSV, rawCSV };
};
