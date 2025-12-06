import { Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export const OrientationLock = () => {
    return (
        <div className="landscape-warning hidden fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-8">
                <motion.div
                    animate={{ rotate: [90, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "backOut"
                    }}
                >
                    <Smartphone size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </motion.div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Rotate to Portrait</h2>
            <p className="text-slate-400 max-w-xs font-medium">This experience is designed for vertical viewing.</p>
        </div>
    );
};
