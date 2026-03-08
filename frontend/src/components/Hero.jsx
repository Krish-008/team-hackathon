import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InteractiveGlobe from './InteractiveGlobe';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="max-w-7xl mx-auto px-12 pt-16 pb-32 text-center md:text-left flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-12">
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">
                        Neural Synthesis Active
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black font-outfit leading-[0.9] text-white uppercase tracking-tighter">
                        Learn <br />
                        Anything. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                            Level Up.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed font-medium">
                        AI-generated knowledge meshes that transform discovery into a high-stakes quest. 
                        Master any domain through a neural lattice.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="flex flex-wrap gap-6 justify-center md:justify-start"
                >
                    <button
                        onClick={() => navigate('/profile')}
                        className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:scale-105 transition-all active:scale-95 shadow-2xl"
                    >
                        Initiate Quest
                    </button>
                    <button className="px-10 py-5 bg-white/5 border border-white/5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all text-white/40 hover:text-white">
                        Access Library
                    </button>
                </motion.div>
                
                {/* Visual Flair Meta-data */}
                <div className="flex gap-12 pt-8 opacity-20 pointer-events-none select-none grayscale">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Lattice_Sync</span>
                        <span className="text-[9px] font-bold text-blue-400">99.82%</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural_Relay</span>
                        <span className="text-[9px] font-bold text-purple-400">ACTIVE</span>
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="flex-1 relative flex justify-center lg:justify-end"
            >
                <InteractiveGlobe />
            </motion.div>
        </section>
    );
};

export default Hero;
