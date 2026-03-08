import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ShaderAnimation from '../components/ShaderAnimation';

const Home = () => {
    const navigate = useNavigate();

    return (
        <ShaderAnimation>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-center space-y-12"
            >
                <div className="space-y-4">
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-[10px] font-black uppercase tracking-[1em] text-blue-500/60 mb-8"
                    >
                        Neural Knowledge Matrix
                    </motion.div>
                    <h1 className="text-7xl md:text-9xl font-black font-outfit tracking-tighter text-white uppercase leading-none">
                        QuestMap<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">.AI</span>
                    </h1>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, letterSpacing: "0.8em" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/overview')}
                    className="px-16 py-6 bg-white text-black font-black uppercase tracking-[0.6em] text-xs transition-all duration-500 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
                >
                    Get Started
                </motion.button>

                <div className="pt-20 opacity-20 pointer-events-none select-none">
                    <span className="text-[10px] font-black tracking-[2em] text-white">SYSTEM_INIT_RESTORE</span>
                </div>
            </motion.div>
        </ShaderAnimation>
    );
};

export default Home;
