
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size'; // Simple hook for window size

interface ConfettiEffectProps {
    onComplete?: () => void;
}

export function ConfettiEffect({ onComplete }: ConfettiEffectProps) {
    const { width, height } = useWindowSize();
    const [isRunning, setIsRunning] = useState(true);

    const handleConfettiComplete = useCallback(() => {
        setIsRunning(false);
        if (onComplete) {
            onComplete();
        }
    }, [onComplete]);

    // Automatically stop after a duration if react-confetti's complete doesn't fire reliably
    useEffect(() => {
        const timer = setTimeout(() => {
             handleConfettiComplete();
        }, 6000); // Stop after 6 seconds max

        return () => clearTimeout(timer);
    }, [handleConfettiComplete]);

    if (!width || !height) {
        return null; // Don't render until window size is available
    }

    return (
        <ReactConfetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={isRunning ? 300 : 0} // Control pieces based on running state
            gravity={0.15}
            initialVelocityY={25}
            onConfettiComplete={handleConfettiComplete}
            className="fixed top-0 left-0 w-full h-full z-[200]" // Ensure it's on top
            colors={['#9945FF', '#14F195', '#FC4A6C', '#45D6FF', '#FFC700']} // Solana-themed colors
            run={isRunning} // Control the animation run state
        />
    );
}
