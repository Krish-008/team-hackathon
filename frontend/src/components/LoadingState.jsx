import React from 'react';
import { motion } from 'framer-motion';

const pulseVariants = {
    animate: {
        opacity: [0.3, 0.6, 0.3],
        transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
    },
};

const LoadingState = ({ message = 'Generating your learning path...', subMessage = 'QuestMap AI is analyzing your profile' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
            {/* Animated orbs */}
            <div className="relative w-24 h-24 mb-8">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: 48 - i * 8,
                            height: 48 - i * 8,
                            left: '50%',
                            top: '50%',
                            background: `radial-gradient(circle, ${['rgba(96,165,250,0.4)', 'rgba(167,139,250,0.3)', 'rgba(52,211,153,0.3)'][i]}, transparent)`,
                        }}
                        animate={{
                            x: ['-50%', `${Math.cos(i * 2.1) * 20 - 50}%`, '-50%'],
                            y: ['-50%', `${Math.sin(i * 2.1) * 20 - 50}%`, '-50%'],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{
                            duration: 2 + i * 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.3,
                        }}
                    />
                ))}
                {/* Center dot */}
                <motion.div
                    className="absolute w-4 h-4 bg-blue-500 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-blue-500/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Text */}
            <motion.p
                className="text-white font-semibold text-base mb-2 text-center"
                variants={pulseVariants}
                animate="animate"
            >
                {message}
            </motion.p>
            <p className="text-gray-500 text-xs text-center">{subMessage}</p>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-6">
                {[0, 1, 2, 3, 4].map(i => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default LoadingState;
