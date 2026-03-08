import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, User, BookOpen, Target, Sparkles, ArrowRight, ChevronDown } from 'lucide-react';

const SKILL_LEVELS = [
    { value: 'beginner', label: 'Beginner', desc: 'Just starting out', color: 'from-green-500 to-emerald-600', icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Have some experience', color: 'from-yellow-500 to-amber-600', icon: '📈' },
    { value: 'advanced', label: 'Advanced', desc: 'Looking to master', color: 'from-red-500 to-rose-600', icon: '🚀' },
];

const Profile = () => {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [skillLevel, setSkillLevel] = useState('beginner');
    const [background, setBackground] = useState('');
    const [goals, setGoals] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsSubmitting(true);

        // Store profile data in sessionStorage for Dashboard to access
        const profileData = {
            topic: topic.trim(),
            skill_level: skillLevel,
            background: background.trim(),
            goals: goals.trim(),
        };
        sessionStorage.setItem('questmap_profile', JSON.stringify(profileData));

        // Small delay for animation feel
        setTimeout(() => {
            navigate('/dashboard');
        }, 600);
    };

    const isValid = topic.trim().length > 0;

    return (
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />

            {/* Nav */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto relative z-10">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Compass className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">QuestMap</span>
                </button>
            </nav>

            {/* Form */}
            <main className="max-w-2xl mx-auto px-6 pt-8 pb-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
                        <Sparkles className="w-3 h-3" />
                        Personalized Learning Path
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                        Tell us about your{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">learning journey</span>
                    </h1>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                        We'll create a personalized knowledge map with recommendations, practice scenarios, and curated resources.
                    </p>
                </motion.div>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="space-y-6"
                >
                    {/* Topic */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                            What do you want to learn? <span className="text-red-400 text-xs">*</span>
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., How to build a Learning based Game app development"
                            className="w-full bg-gray-800/70 border border-gray-700 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm"
                            required
                        />
                    </div>

                    {/* Skill Level */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                            <Target className="w-4 h-4 text-purple-400" />
                            Your current skill level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {SKILL_LEVELS.map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setSkillLevel(level.value)}
                                    className={`relative rounded-2xl p-4 border text-left transition-all ${
                                        skillLevel === level.value
                                            ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                                            : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                                    }`}
                                >
                                    <span className="text-xl mb-1 block">{level.icon}</span>
                                    <span className="text-white text-xs font-bold block">{level.label}</span>
                                    <span className="text-gray-500 text-[10px]">{level.desc}</span>
                                    {skillLevel === level.value && (
                                        <motion.div
                                            layoutId="skill-ring"
                                            className="absolute inset-0 rounded-2xl border-2 border-blue-500/40"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Background */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                            <User className="w-4 h-4 text-emerald-400" />
                            Your background <span className="text-gray-600 text-xs font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                            placeholder="e.g., Software engineer with 3 years of Python experience, familiar with basic ML concepts..."
                            rows={3}
                            className="w-full bg-gray-800/70 border border-gray-700 rounded-2xl py-3.5 px-5 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    {/* Goals */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                            <Target className="w-4 h-4 text-amber-400" />
                            Learning goals <span className="text-gray-600 text-xs font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            placeholder="e.g., Build a portfolio project, switch careers to game development, learn enough to lead a team..."
                            rows={2}
                            className="w-full bg-gray-800/70 border border-gray-700 rounded-2xl py-3.5 px-5 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        whileHover={isValid ? { scale: 1.01 } : {}}
                        whileTap={isValid ? { scale: 0.98 } : {}}
                        className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                            isValid && !isSubmitting
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <motion.div
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                />
                                Building Your Quest...
                            </>
                        ) : (
                            <>
                                Generate My Learning Path
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </motion.button>
                </motion.form>
            </main>
        </div>
    );
};

export default Profile;
