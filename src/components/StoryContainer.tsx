import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface StoryContainerProps {
    children: React.ReactNode;
}

export const StoryContainer: React.FC<StoryContainerProps> = ({ children }) => {
    // Convert children to array to handle single child case robustly
    const slides = React.Children.toArray(children);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // 1 = down, -1 = up
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const handleNext = useCallback(() => {
        if (currentIndex < slides.length - 1) {
            setDirection(1);
            setCurrentIndex((prev) => prev + 1);
        }
    }, [currentIndex, slides.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex((prev) => prev - 1);
        }
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === ' ') {
                handleNext();
            } else if (e.key === 'ArrowUp') {
                handlePrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev]);

    // Wheel navigation (throttled)
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > 50) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (e.deltaY > 0) handleNext();
                    else handlePrev();
                }, 300); // Debounce
            }
        };
        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, [handleNext, handlePrev]);

    const variants = {
        enter: (direction: number) => ({
            y: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            y: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            y: direction > 0 ? '-100%' : '100%',
            // opacity: 0, // Keep opacity 1 for "card stack" feel or fade out?
            // Let's fade out slightly
            opacity: 0.5,
        }),
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientY);
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart) return;
        const touchEnd = e.changedTouches[0].clientY;
        const diff = touchStart - touchEnd;

        // Swipe Up (Next)
        if (diff > 50) {
            handleNext();
        }
        // Swipe Down (Prev)
        else if (diff < -50) {
            handlePrev();
        }
        setTouchStart(null);
    };

    return (
        <div
            className="relative h-screen w-full overflow-hidden bg-black text-white"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        y: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    className="absolute inset-0 flex items-center justify-center p-4"
                >
                    {slides[currentIndex]}
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={clsx(
                            "w-1.5 rounded-full transition-all duration-300",
                            idx === currentIndex ? "h-6 bg-white" : "h-1.5 bg-gray-600 cursor-pointer hover:bg-gray-400"
                        )}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
