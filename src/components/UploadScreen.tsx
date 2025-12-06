
import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
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
        <div className="min-h-screen h-full bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-breathe" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-breathe-delayed" />

            {/* Minimalist Container - No GlassCard */}
            <div className="w-full max-w-md relative z-10 flex flex-col gap-6 my-10">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600/20 backdrop-blur-xl border border-blue-400/20 shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)] mb-2">
                        <Upload className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl mb-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">STRONG</span>
                            <br />
                            <span className="text-blue-500">WRAPPED</span>
                        </h1>
                        <p className="text-blue-200/50 font-medium tracking-wide">Visualize your year in gains</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-sm text-center backdrop-blur-md">
                        {error}
                    </div>
                )}

                <div className="space-y-8">
                    {/* Animated Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={clsx(
                            "relative group cursor-pointer transition-all duration-500",
                            isDragging ? "scale-105" : "hover:scale-[1.02]"
                        )}
                    >
                        <div className={clsx(
                            "absolute inset-0 rounded-[2rem] text-center transition-all duration-500",
                            isDragging
                                ? "bg-blue-500/20 border-2 border-blue-400 blur-sm"
                                : "bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-white/20 hover:bg-white/10"
                        )} />

                        <div className="relative py-8 px-8 flex flex-col items-center justify-center min-h-[120px]">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileInput}
                                accept=".csv"
                                className="hidden"
                            />

                            {file ? (
                                <div className="space-y-3 text-center animate-in fade-in zoom-in duration-300">
                                    <FileSpreadsheet className="w-12 h-12 text-blue-400 mx-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <div>
                                        <p className="text-xl font-bold text-white">{file.name}</p>
                                        <p className="text-sm text-blue-200/50">Ready to analyze</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-center">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <FileSpreadsheet className="w-6 h-6 text-blue-200/50 group-hover:text-blue-100 transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-white group-hover:text-blue-100 transition-colors">
                                            Select CSV File
                                        </p>
                                        <p className="text-xs text-blue-200/30 uppercase tracking-widest font-bold mt-1">
                                            or drag and drop
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {availableYears.length > 0 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full overflow-hidden">
                            <label className="text-xs text-blue-200/40 uppercase tracking-widest font-bold ml-4">Year</label>
                            {/* Horizontal Scroll Container for Years */}
                            <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide snap-x">
                                {availableYears.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setYear(y)}
                                        className={clsx(
                                            "flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border snap-center",
                                            year === y
                                                ? "bg-white text-black border-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] scale-[1.05]"
                                                : "bg-transparent text-blue-200/40 border-white/5 hover:border-white/20 hover:text-white"
                                        )}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-xs text-blue-200/40 uppercase tracking-widest font-bold ml-4">Units</label>
                        <div className="flex gap-4 justify-center">
                            {(['lbs', 'kg'] as const).map((u) => (
                                <button
                                    key={u}
                                    onClick={() => setUnits(u)}
                                    className={clsx(
                                        "flex-1 py-4 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-300 border",
                                        units === u
                                            ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_30px_-10px_rgba(37,99,235,0.4)]"
                                            : "bg-transparent text-blue-200/20 border-white/5 hover:border-white/10 hover:text-white/60"
                                    )}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!file || !year || isParsing}
                        className={clsx(
                            "w-full py-5 rounded-[2rem] font-black text-xl tracking-wide uppercase transition-all duration-300 shadow-2xl relative overflow-hidden group border",
                            (!file || !year || isParsing)
                                ? "bg-slate-900/50 text-white/10 border-white/5 cursor-not-allowed"
                                : "bg-white text-black border-white hover:scale-[1.02] active:scale-[0.98] shadow-white/20"
                        )}
                    >
                        <span className="relative z-10">
                            {isParsing ? 'Processing...' : 'Generate'}
                        </span>
                        {/* Hover shine */}
                        {file && year && !isParsing && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                        )}
                    </button>
                </div>

                <div className="text-center pt-8">
                    <p className="text-[10px] text-blue-200/20 font-mono uppercase tracking-[0.2em] hover:text-blue-200/40 transition-colors cursor-default">
                        Privacy First • Local Only
                    </p>
                </div>
            </div>
        </div>
    );
};
