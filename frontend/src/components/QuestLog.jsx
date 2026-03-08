import React from 'react';
import { motion } from 'framer-motion';
import { History, Play, Trash2, Calendar, BookOpen, ChevronRight, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

const QuestLog = ({ quests, onResume, onDelete, loading }) => {
    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 animate-pulse">Accessing Neural Archives...</span>
            </div>
        );
    }

    if (!quests || quests.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
                <History className="w-12 h-12 text-white/10 mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">No archives found. Begin a new quest.</span>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-6 mb-6">
                <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Neural Archives</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{quests.length} Quests Stored</span>
            </div>

            <div className="grid gap-3">
                {quests.map((quest, index) => (
                    <motion.div
                        key={quest._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        <div className="relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 p-5 rounded-3xl transition-all flex items-center justify-between gap-6 backdrop-blur-xl">
                            <div className="flex items-center gap-5 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center border border-white/5 shadow-inner">
                                    <LayoutGrid className="w-5 h-5 text-white/40 group-hover:text-blue-400 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-sm font-black uppercase tracking-tight text-white truncate">{quest.topic}</h4>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            quest.skillLevel === 'beginner' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                quest.skillLevel === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                        )}>
                                            {quest.skillLevel}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/20">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(quest.timestamp).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <BookOpen className="w-3 h-3" />
                                            {quest.mapData?.nodes?.length || 0} Nodes
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                <button
                                    onClick={() => onResume(quest)}
                                    className="px-5 py-2.5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-white/5"
                                >
                                    <Play className="w-3 h-3 fill-current" /> Resume
                                </button>
                                <button
                                    onClick={() => onDelete(quest._id)}
                                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-colors border border-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default QuestLog;
