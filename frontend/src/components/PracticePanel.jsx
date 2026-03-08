import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Code, BookOpen, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Multiple Choice ────────────────────────────────────────────────────────

const MultipleChoice = ({ scenario }) => {
    const [selected, setSelected] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const isCorrect = selected === scenario.correct_answer;
    const hasAnswered = selected !== null;

    return (
        <div className="space-y-3">
            <p className="text-white text-sm font-medium leading-relaxed">{scenario.question}</p>
            <div className="space-y-2">
                {(scenario.options || []).map((opt, i) => {
                    let optClass = 'border-gray-700 hover:border-gray-500 bg-gray-800/40';
                    if (hasAnswered) {
                        if (i === scenario.correct_answer) optClass = 'border-green-500/50 bg-green-500/10';
                        else if (i === selected) optClass = 'border-red-500/50 bg-red-500/10';
                        else optClass = 'border-gray-800 bg-gray-900/30 opacity-50';
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => { if (!hasAnswered) { setSelected(i); setShowExplanation(true); } }}
                            disabled={hasAnswered}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${optClass}`}
                        >
                            <span className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                                {String.fromCharCode(65 + i)}
                            </span>
                            <span className={hasAnswered && i === scenario.correct_answer ? 'text-green-300' : hasAnswered && i === selected ? 'text-red-300' : 'text-gray-300'}>
                                {opt}
                            </span>
                            {hasAnswered && i === scenario.correct_answer && <CheckCircle className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />}
                            {hasAnswered && i === selected && i !== scenario.correct_answer && <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />}
                        </button>
                    );
                })}
            </div>
            <AnimatePresence>
                {showExplanation && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={`p-3 rounded-xl text-xs leading-relaxed ${isCorrect ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'}`}>
                            <p className="font-semibold mb-1">{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</p>
                            <p className="text-gray-300">{scenario.explanation}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Scenario Based ─────────────────────────────────────────────────────────

const ScenarioBased = ({ scenario }) => {
    const [showSolution, setShowSolution] = useState(false);

    return (
        <div className="space-y-3">
            <p className="text-white text-sm font-medium leading-relaxed">{scenario.question}</p>
            {scenario.context && (
                <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-3 text-xs text-gray-400 leading-relaxed">
                    <span className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider block mb-1">Context</span>
                    {scenario.context}
                </div>
            )}
            <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
                {showSolution ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
            <AnimatePresence>
                {showSolution && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2">
                            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 text-xs text-gray-300 leading-relaxed">
                                <span className="text-blue-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">Solution</span>
                                {scenario.solution}
                            </div>
                            {scenario.key_takeaway && (
                                <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3 text-xs text-purple-300 leading-relaxed">
                                    <span className="text-purple-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">💡 Key Takeaway</span>
                                    {scenario.key_takeaway}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Code Challenge ─────────────────────────────────────────────────────────

const CodeChallenge = ({ scenario }) => {
    const [showSolution, setShowSolution] = useState(false);

    return (
        <div className="space-y-3">
            <p className="text-white text-sm font-medium leading-relaxed">{scenario.question}</p>
            {scenario.starter_code && (
                <div className="bg-gray-950 border border-gray-700/50 rounded-xl p-4 overflow-x-auto">
                    <span className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider block mb-2">Starter Code</span>
                    <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">{scenario.starter_code}</pre>
                </div>
            )}
            <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
                <Code className="w-3.5 h-3.5" />
                {showSolution ? 'Hide Solution' : 'View Solution'}
            </button>
            <AnimatePresence>
                {showSolution && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-2"
                    >
                        <div className="bg-gray-950 border border-emerald-500/20 rounded-xl p-4 overflow-x-auto">
                            <span className="text-emerald-400 font-semibold text-[10px] uppercase tracking-wider block mb-2">Solution</span>
                            <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">{scenario.solution_code}</pre>
                        </div>
                        {scenario.explanation && (
                            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 text-xs text-gray-300 leading-relaxed">
                                {scenario.explanation}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Difficulty Badge ───────────────────────────────────────────────────────

const DifficultyBadge = ({ difficulty }) => {
    const colors = {
        beginner: 'bg-green-500/15 text-green-400 border-green-500/20',
        intermediate: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
        advanced: 'bg-red-500/15 text-red-400 border-red-500/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colors[difficulty] || colors.beginner}`}>
            {difficulty}
        </span>
    );
};

// ─── Type Icon ──────────────────────────────────────────────────────────────

const TypeIcon = ({ type }) => {
    const icons = {
        multiple_choice: <HelpCircle className="w-4 h-4 text-blue-400" />,
        scenario: <BookOpen className="w-4 h-4 text-purple-400" />,
        code_challenge: <Code className="w-4 h-4 text-emerald-400" />,
    };
    return icons[type] || icons.multiple_choice;
};

// ─── Main Panel ─────────────────────────────────────────────────────────────

const PracticePanel = ({ practiceData, loading, selectedNode }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {selectedNode && (
                    <div className="flex items-center gap-2 mb-6 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Generating Practice for: {selectedNode.label}
                        </span>
                    </div>
                )}
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-800/40 rounded-2xl h-32 border border-gray-700/30" />
                ))}
            </div>
        );
    }

    if (!practiceData?.scenarios?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <BookOpen className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm italic">Click a node on the map to generate practice scenarios</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 custom-scrollbar">
            {selectedNode && (
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Practice: {selectedNode.label}
                    </span>
                </div>
            )}
            {practiceData.practice_title && (
                <h3 className="text-white font-bold text-base">{practiceData.practice_title}</h3>
            )}
            {practiceData.scenarios.map((scenario, i) => (
                <motion.div
                    key={scenario.id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-5"
                >
                    {/* Scenario Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <TypeIcon type={scenario.type} />
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                            {(scenario.type || '').replace('_', ' ')}
                        </span>
                        <DifficultyBadge difficulty={scenario.difficulty} />
                        <span className="text-gray-600 text-[10px] ml-auto">#{i + 1}</span>
                    </div>

                    {/* Scenario Content */}
                    {scenario.type === 'multiple_choice' && <MultipleChoice scenario={scenario} />}
                    {scenario.type === 'scenario' && <ScenarioBased scenario={scenario} />}
                    {scenario.type === 'code_challenge' && <CodeChallenge scenario={scenario} />}
                </motion.div>
            ))}
        </div>
    );
};

export default PracticePanel;
