import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../GlassCard';

interface IntroSlideProps {
    year: number;
}

export const IntroSlide: React.FC<IntroSlideProps> = ({ year }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4">
            <GlassCard className="items-center justify-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-6xl font-black tracking-tighter mb-4 text-white drop-shadow-xl filter">
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">WRAPPED</span>
                    </h1>
                    <p className="text-3xl font-light text-blue-400 drop-shadow-md">
                        {year}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-12"
                >
                    <p className="text-lg text-blue-100/80 font-medium tracking-wide">
                        You've put in the work.<br />Let's see the numbers.
                    </p>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 text-blue-200/50 text-xs font-mono tracking-widest uppercase"
                >
                    Scroll / Swipe
                </motion.div>
            </GlassCard>
        </div>
    );
};
