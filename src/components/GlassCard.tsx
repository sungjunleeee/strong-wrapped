import React, { type ReactNode } from 'react';
import clsx from 'clsx';

interface GlassCardProps {
    children: ReactNode;
    className?: string; // For layout overrides
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
    return (
        <div
            className={clsx(
                // Base Layout: Enforce 9:16 Aspect Ratio
                "relative flex flex-col p-8 rounded-[40px] overflow-hidden",
                // Size & Scaling:
                // 1. w-full: Tries to fill width (mobile)
                // 2. aspect-[9/16]: Enforces the ratio, deriving height from width
                // 3. max-w-[...]: Constrains width so that resultant height doesn't exceed viewport (desktop)
                "w-full aspect-[9/16] mx-auto",
                "max-w-[calc((100vh-2rem)*9/16)]",
                className
            )}
            style={{
                background: 'rgb(8, 8, 10)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
        >
            {/* Fluid Ambient Gradients (Base Layer) */}
            <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none animate-breathe" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[50%] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none animate-breathe-delayed" />

            {/* Glass Surface Overlay */}
            {/* 1. Frosted Glaze */}
            <div className="absolute inset-0 bg-white/[0.02] pointer-events-none z-0" />

            {/* 2. Edge Highlight (Rim Light) */}
            <div className="absolute inset-0 rounded-[40px] border border-white/10 pointer-events-none z-50 ring-1 ring-white/5" />

            {/* 3. Glossy Reflection (Top-Left) */}
            <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none z-0" />

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col h-full bg-transparent">
                {children}
            </div>
        </div>
    );
};
