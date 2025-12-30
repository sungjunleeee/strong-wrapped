import React, { useRef, useState, useEffect } from 'react';
import type { YearStats } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Share2, CheckSquare, Square, Loader2 } from 'lucide-react';
import { BackgroundHeatmap } from '../BackgroundHeatmap';


interface SummarySlideProps {
    stats: YearStats;
}

export const SummarySlide: React.FC<SummarySlideProps> = ({ stats }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [scale, setScale] = useState(1);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        const calculateScale = () => {
            // Reserve space: 
            // Width: 32px (px-4 padding)
            // Height: 160px (Controls at bottom + top padding)
            const availableWidth = window.innerWidth - 32;
            const availableHeight = window.innerHeight - 160;

            const scaleX = availableWidth / 360;
            const scaleY = availableHeight / 640;

            // Limit max scale to 1 (don't upscale on huge screens)
            // But allow downscaling as much as needed
            setScale(Math.min(1, scaleX, scaleY));
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, []);

    // Warm up html-to-image to prevent first-click issues (common with font loading or canvas init)
    useEffect(() => {
        if (ref.current && showHeatmap) {
            // We moved to Canvas which is much lighter, so we can re-enable this warmup 
            // to ensure the canvas is captured correctly on the first real "Share" click.
            // We use a timeout to let the fade-in animation start smoothly first.
            const timer = setTimeout(() => {
                toPng(ref.current!, { cacheBust: false, pixelRatio: 1, width: 1, height: 1 })
                    .catch(() => { });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [showHeatmap]);

    const handleShare = async () => {
        if (ref.current && !isSharing) {
            setIsSharing(true);

            // Fire clipboard copy separately (parallel), don't await execution to avoid blocking
            // Use legacy first if on mobile/safari often problematic with async clipboard during other async ops
            (async () => {
                const text = 'Check out my year in lifting! 💪 #StrongWrapped https://sungjunleeee.github.io/strong-wrapped/';
                try {
                    await navigator.clipboard.writeText(text);
                    console.log('Copied to clipboard (Async):', text);
                } catch (err) {
                    console.warn('Async copy failed, trying legacy', err);
                    try {
                        const textArea = document.createElement("textarea");
                        textArea.value = text;
                        textArea.style.position = "fixed";
                        textArea.style.opacity = "0";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        console.log('Copied to clipboard (Legacy):', text);
                    } catch (legacyErr) {
                        console.error('All clipboard methods failed', legacyErr);
                    }
                }
            })();

            // Delay actual image gen slightly to allow "Generating" state to render
            // Increased delay to ensure the UI thread has time to paint before the heavy toPng calculation starts
            await new Promise(resolve => setTimeout(resolve, 100));

            try {
                if (ref.current) {
                    // Double-render strategy:
                    // If heatmap (canvas) is visible, the first capture might be empty or incomplete
                    // This is a known quirk with html-to-image and canvases/webgl
                    // We run a low-res capture first to force the serializer to "wake up"
                    if (showHeatmap) {
                        try {
                            await toPng(ref.current, { cacheBust: false, pixelRatio: 1, width: 360, height: 640 });
                        } catch (e) { /* ignore */ }
                    }

                    const dataUrl = await toPng(ref.current, {
                        cacheBust: false, // Removed cacheBust as it sends extra requests and we don't have remote images
                        pixelRatio: 3,
                        width: 360,
                        height: 640
                    });

                    // Proceed with sharing...
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    const file = new File([blob], `strong-wrapped-${stats.year}.png`, { type: 'image/png' });

                    if (navigator.share) {
                        const shareData = { files: [file] };
                        if (navigator.canShare && navigator.canShare(shareData)) {
                            await navigator.share(shareData);
                        } else {
                            console.warn('Device does not support file sharing');
                        }
                    }
                }
            } catch (err) {
                console.error('Sharing failed:', err);
            } finally {
                setIsSharing(false);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4 overflow-hidden relative">
            {/* 
                We use a fixed size container (360x640) for the capture area to ensure consistent export.
                We scale it down using CSS transform to fit smaller screens.
            */}
            <div className="relative w-full h-full flex items-center justify-center pb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: scale }}
                    transition={{ duration: 0.5 }}
                    style={{
                        transformOrigin: 'center center',
                        // We use the calculated scale state here instead of CSS calc
                        transform: `scale(${scale})`
                    }}
                >
                    <div
                        ref={ref}
                        className="relative w-[360px] h-[640px] rounded-[40px] overflow-hidden flex flex-col justify-between p-8"
                        style={{
                            background: 'rgb(8, 8, 10)', // Deep dark base
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' // Basic shadow
                        }}
                    >
                        {/* 
                            Liquid Glass Effect Layers:
                            1. Fluid Background (Heatmap or Gradients)
                            2. Glass Surface Treatment (Gloss, Border, Noise)
                         */}

                        {/* Fluid Ambient Gradients (Base Layer) */}
                        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none animate-breathe" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[50%] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none animate-breathe-delayed" />

                        {/* Heatmap Layer */}
                        <AnimatePresence>
                            {showHeatmap && (
                                <BackgroundHeatmap key="heatmap" stats={stats} />
                            )}
                        </AnimatePresence>

                        {/* Glass Surface Overlay - The "Liquid Glass" Sheen */}
                        {/* 1. Frosted Glaze - Removed blur for export consistency */}
                        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none z-0" />

                        {/* 2. Edge Highlight (Rim Light) */}
                        <div className="absolute inset-0 rounded-[40px] border border-white/10 pointer-events-none z-50 ring-1 ring-white/5" />

                        {/* 3. Glossy Reflection (Top-Left) */}
                        <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none z-0" />

                        {/* Content Layer */}
                        <div className="relative z-10 flex flex-col h-full bg-transparent">
                            <div className="mt-12 mb-6 flex items-baseline gap-3">
                                <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-lg filter">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">WRAPPED</span>
                                </h1>
                                <p className="text-xl text-blue-400 font-bold drop-shadow-md">{stats.year}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-900/30 p-5 rounded-3xl border border-white/10">
                                    <div className="text-3xl font-bold text-white drop-shadow-sm">{stats.totalWorkouts}</div>
                                    <div className="text-[10px] text-blue-200/70 uppercase tracking-wider font-bold mt-1">Workouts</div>
                                </div>
                                <div className="bg-slate-900/30 p-5 rounded-3xl border border-white/10">
                                    <div className="text-3xl font-bold text-white drop-shadow-sm">{Math.round(stats.totalDurationMinutes / 60)}h</div>
                                    <div className="text-[10px] text-blue-200/70 uppercase tracking-wider font-bold mt-1">Time</div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-8">
                                <div>
                                    <div className="text-6xl font-black text-white tracking-tighter drop-shadow-xl flex items-baseline gap-2">
                                        {(stats.totalVolume / 1000).toFixed(1)}
                                        <span className="text-2xl text-blue-400/80 font-bold tracking-normal">k</span>
                                    </div>
                                    <div className="text-xs text-blue-200/60 uppercase tracking-widest font-bold ml-1">{stats.units} Volume</div>
                                </div>

                                <div>
                                    <div className="text-lg font-bold text-blue-400 mb-2 drop-shadow-md">{stats.heaviestLift.name}</div>
                                    <div className="text-4xl font-bold text-white drop-shadow-lg">{stats.heaviestLift.weight} <span className="text-lg text-white/50 font-normal">{stats.units}</span></div>
                                    <div className="text-[10px] text-blue-200/60 uppercase tracking-widest font-bold mt-1">Heaviest Lift</div>
                                </div>
                            </div>

                            <div className="text-center mt-auto pt-6">
                                <div className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase">strong wrapped</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex flex-col gap-4 items-center z-50">
                <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-slate-800"
                >
                    {showHeatmap ? <CheckSquare size={16} className="text-green-500" /> : <Square size={16} />}
                    Include Heatmap
                </button>

                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-white/10 disabled:opacity-80 disabled:cursor-wait"
                >
                    {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                    {isSharing ? 'Generating...' : 'Share Image'}
                </button>
            </div>
        </div>
    );
};
