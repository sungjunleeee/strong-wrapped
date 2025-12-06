
import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from './GlassCard';
import clsx from 'clsx';
import { parseStrongCSV } from '../utils/parser';

interface UploadScreenProps {
    onDataLoaded: (csvText: string, year: number, units: 'kg' | 'lbs') => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onDataLoaded }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [csvText, setCsvText] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [year, setYear] = useState<number | null>(null);
    const [units, setUnits] = useState<'kg' | 'lbs'>('lbs');
    const [error, setError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        processFile(droppedFile);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (f: File) => {
        setError(null);
        setAvailableYears([]);
        setYear(null);

        if (f.type !== 'text/csv' && !f.name.endsWith('.csv')) {
            setError('Please upload a valid CSV file.');
            return;
        }

        setFile(f);
        setIsParsing(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (text) {
                setCsvText(text);
                try {
                    const rawData = await parseStrongCSV(text);
                    const years = new Set<number>();
                    rawData.forEach(row => {
                        if (row.Date) {
                            const y = new Date(row.Date).getFullYear();
                            if (!isNaN(y)) years.add(y);
                        }
                    });

                    const sortedYears = Array.from(years).sort((a, b) => b - a);
                    if (sortedYears.length > 0) {
                        setAvailableYears(sortedYears);
                        setYear(sortedYears[0]); // Default to latest
                    } else {
                        setError('No valid dates found in the CSV.');
                    }
                } catch (err) {
                    console.error(err);
                    setError('Failed to parse CSV.');
                } finally {
                    setIsParsing(false);
                }
            }
        };
        reader.readAsText(f);
    };

    const handleGenerate = () => {
        if (!csvText || !year) return;
        onDataLoaded(csvText, year, units);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-breathe" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-breathe-delayed" />

            <div className="w-full max-w-md relative z-10">
                <GlassCard className="!h-auto !aspect-auto min-h-[600px] justify-center gap-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 mb-4 ring-1 ring-white/10">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-xl">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">STRONG</span>
                            <br />
                            <span className="text-blue-500">WRAPPED</span>
                        </h1>
                        <p className="text-blue-200/60 font-medium">Visualize your year in gains</p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={clsx(
                                "border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden",
                                isDragging
                                    ? "border-blue-400 bg-blue-500/10 scale-[1.02]"
                                    : "border-white/10 bg-slate-900/40 hover:border-blue-400/50 hover:bg-slate-900/60"
                            )}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileInput}
                                accept=".csv"
                                className="hidden"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                            <FileSpreadsheet className={clsx(
                                "w-12 h-12 mx-auto mb-4 transition-colors duration-300",
                                isDragging ? "text-blue-400" : "text-blue-200/40 group-hover:text-blue-400"
                            )} />

                            {file ? (
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-white">{file.name}</p>
                                    <p className="text-sm text-blue-200/60">Ready to analyze</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-white group-hover:text-blue-100 transition-colors">
                                        Drop your CSV here
                                    </p>
                                    <p className="text-xs text-blue-200/40 uppercase tracking-widest font-bold">
                                        or tap to browse
                                    </p>
                                </div>
                            )}
                        </div>

                        {availableYears.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-xs text-blue-200/60 uppercase tracking-widest font-bold ml-1">Select Year</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {availableYears.map(y => (
                                        <button
                                            key={y}
                                            onClick={() => setYear(y)}
                                            className={clsx(
                                                "py-3 rounded-xl text-sm font-bold transition-all duration-300 ring-1 ring-white/5 shadow-lg",
                                                year === y
                                                    ? "bg-blue-500 text-white shadow-blue-500/25 scale-105"
                                                    : "bg-slate-900/40 text-blue-200/60 hover:bg-slate-800/60 hover:text-white"
                                            )}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-xs text-blue-200/60 uppercase tracking-widest font-bold ml-1">Preferred Unit</label>
                            <div className="bg-slate-900/40 p-1.5 rounded-2xl ring-1 ring-white/5 flex relative">
                                <div
                                    className="absolute h-[calc(100%-12px)] top-1.5 w-[calc(50%-6px)] bg-blue-500 rounded-xl shadow-lg transition-all duration-300"
                                    style={{
                                        left: units === 'lbs' ? '6px' : 'calc(50%)'
                                    }}
                                />
                                <button
                                    onClick={() => setUnits('lbs')}
                                    className={clsx(
                                        "flex-1 py-3 text-sm font-bold relative z-10 transition-colors duration-300",
                                        units === 'lbs' ? "text-white" : "text-blue-200/40 hover:text-white"
                                    )}
                                >
                                    LBS
                                </button>
                                <button
                                    onClick={() => setUnits('kg')}
                                    className={clsx(
                                        "flex-1 py-3 text-sm font-bold relative z-10 transition-colors duration-300",
                                        units === 'kg' ? "text-white" : "text-blue-200/40 hover:text-white"
                                    )}
                                >
                                    KG
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!file || !year || isParsing}
                            className={clsx(
                                "w-full py-4 rounded-2xl font-black text-lg tracking-wide uppercase transition-all duration-300 shadow-xl relative overflow-hidden group",
                                (!file || !year || isParsing)
                                    ? "bg-slate-800/50 text-white/20 cursor-not-allowed"
                                    : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-white/10"
                            )}
                        >
                            <span className="relative z-10">
                                {isParsing ? 'Crunching Numbers...' : 'Generate Wrapped'}
                            </span>
                            {/* Hover shine */}
                            {file && year && !isParsing && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-blue-200/20 font-mono uppercase tracking-widest">
                            Privacy First • Local Processing Only
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
