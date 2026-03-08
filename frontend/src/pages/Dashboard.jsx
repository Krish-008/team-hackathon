import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Map, Lightbulb, BookOpen, Youtube, LogOut, User, Clock, Brain, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import KnowledgeMap from '../components/KnowledgeMap';
import RecommendationList from '../components/RecommendationCard';
import PracticePanel from '../components/PracticePanel';
import ResourcePanel from '../components/ResourcePanel';
import LoadingState from '../components/LoadingState';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const TABS = [
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, color: 'text-amber-400' },
    { id: 'practice', label: 'Practice', icon: BookOpen, color: 'text-emerald-400' },
    { id: 'resources', label: 'Resources', icon: Youtube, color: 'text-red-400' },
];

const Dashboard = () => {
    const navigate = useNavigate();

    // Profile state
    const [profile, setProfile] = useState(null);
    const [profileData, setProfileData] = useState(null);

    // Data states
    const [mapData, setMapData] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [practiceData, setPracticeData] = useState(null);
    const [resourceData, setResourceData] = useState(null);

    // UI states
    const [selectedNode, setSelectedNode] = useState(null);
    const [activeTab, setActiveTab] = useState('recommendations');
    const [loading, setLoading] = useState({ profile: false, map: false, recommendations: false, practice: false, resources: false });
    const [error, setError] = useState(null);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Load profile from sessionStorage on mount
    useEffect(() => {
        const stored = sessionStorage.getItem('questmap_profile');
        if (!stored) {
            navigate('/profile');
            return;
        }
        try {
            const parsed = JSON.parse(stored);
            setProfile(parsed);
        } catch {
            navigate('/profile');
        }
    }, [navigate]);

    // Fetch helper
    const apiFetch = useCallback(async (endpoint, body) => {
        const res = await fetch(`${API_BASE}/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `API error: ${res.status}`);
        }
        return res.json();
    }, []);

    // Initial data generation
    useEffect(() => {
        if (!profile || initialLoadComplete) return;

        const generateInitialData = async () => {
            setError(null);

            try {
                // Step 1: Generate profile & learning history
                setLoading(l => ({ ...l, profile: true }));
                const profResult = await apiFetch('generate-profile', profile);
                setProfileData(profResult);
                setLoading(l => ({ ...l, profile: false }));

                // Step 2: Generate knowledge map (using profile data)
                setLoading(l => ({ ...l, map: true }));
                const mapResult = await apiFetch('generate-map', {
                    ...profile,
                    learning_history: profResult.learning_history,
                });
                setMapData(mapResult);
                setLoading(l => ({ ...l, map: false }));

                // Step 3: Generate recommendations
                setLoading(l => ({ ...l, recommendations: true }));
                const recResult = await apiFetch('generate-recommendations', {
                    ...profile,
                    learning_history: profResult.learning_history,
                    knowledge_gaps: profResult.knowledge_gaps,
                });
                setRecommendations(recResult.recommendations);
                setLoading(l => ({ ...l, recommendations: false }));

                setInitialLoadComplete(true);
            } catch (err) {
                console.error('Generation error:', err);
                setError(err.message);
                setLoading({ profile: false, map: false, recommendations: false, practice: false, resources: false });
            }
        };

        generateInitialData();
    }, [profile, initialLoadComplete, apiFetch]);

    // Load node-specific data when a node is selected
    const handleNodeSelect = useCallback(async (node) => {
        setSelectedNode(node);

        // Load practice scenarios for this node
        setLoading(l => ({ ...l, practice: true }));
        try {
            const practiceResult = await apiFetch('generate-practice', {
                topic: profile.topic,
                node_label: node.label,
                skill_level: profile.skill_level,
                key_concepts: node.key_concepts,
            });
            setPracticeData(practiceResult);
        } catch (err) {
            console.error('Practice generation error:', err);
        }
        setLoading(l => ({ ...l, practice: false }));

        // Load resources for this node
        setLoading(l => ({ ...l, resources: true }));
        try {
            const resourceResult = await apiFetch('generate-resources', {
                topic: profile.topic,
                node_label: node.label,
                skill_level: profile.skill_level,
            });
            setResourceData(resourceResult);
        } catch (err) {
            console.error('Resource generation error:', err);
        }
        setLoading(l => ({ ...l, resources: false }));
    }, [profile, apiFetch]);

    const handleLogout = () => {
        sessionStorage.removeItem('questmap_profile');
        navigate('/');
    };

    const handleNewTopic = () => {
        sessionStorage.removeItem('questmap_profile');
        navigate('/profile');
    };

    // Initial loading state
    if (!profile) return null;

    if (!initialLoadComplete && (loading.profile || loading.map || loading.recommendations)) {
        const msg = loading.profile
            ? 'Analyzing your learning profile...'
            : loading.map
                ? 'Building your knowledge map...'
                : 'Generating personalized recommendations...';
        const sub = loading.profile
            ? 'Creating synthetic learning history based on your background'
            : loading.map
                ? 'Mapping prerequisites and learning paths with Bloom\'s taxonomy'
                : 'Matching recommendations to your specific knowledge gaps';

        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <LoadingState message={msg} subMessage={sub} />
            </div>
        );
    }

    if (error && !initialLoadComplete) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
                <div className="max-w-md text-center">
                    <div className="text-red-400 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">Generation Failed</h2>
                    <p className="text-gray-400 text-sm mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => { setError(null); setInitialLoadComplete(false); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                        <button onClick={handleNewTopic} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium text-sm transition-colors">
                            Change Topic
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="flex-shrink-0 border-b border-gray-800 px-5 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Compass className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base font-bold tracking-tight">QuestMap</span>
                        </div>
                        <div className="h-5 w-px bg-gray-800" />
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-gray-300 max-w-[300px] truncate">{profile.topic}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            profile.skill_level === 'beginner' ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                            profile.skill_level === 'intermediate' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                            'bg-red-500/15 text-red-400 border border-red-500/20'
                        }`}>
                            {profile.skill_level}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {profileData && (
                            <div className="hidden md:flex items-center gap-3 text-[10px] text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    ~{profileData.estimated_total_hours || mapData?.total_estimated_hours || '?'}h total
                                </span>
                                <span className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {profileData.recommended_pace} pace
                                </span>
                            </div>
                        )}
                        <button onClick={handleNewTopic} className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors font-medium">
                            New Topic
                        </button>
                        <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Learner summary */}
                {profileData?.learner_summary && (
                    <p className="text-gray-500 text-[11px] mt-1.5 max-w-3xl leading-relaxed">{profileData.learner_summary}</p>
                )}
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Knowledge Map */}
                <div className="flex-1 flex flex-col border-r border-gray-800 min-w-0">
                    {/* Map Header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/50">
                        <div className="flex items-center gap-2">
                            <Map className="w-4 h-4 text-blue-400" />
                            <h2 className="text-sm font-bold text-gray-200">{mapData?.map_title || 'Knowledge Map'}</h2>
                        </div>
                        {selectedNode && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-xs"
                            >
                                <span className="text-gray-500">Selected:</span>
                                <span className="text-blue-400 font-semibold">{selectedNode.label}</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Map Canvas */}
                    <div className="flex-1 p-4">
                        <KnowledgeMap
                            mapData={mapData}
                            selectedNode={selectedNode}
                            onNodeSelect={handleNodeSelect}
                        />
                    </div>

                    {/* Selected Node Detail Bar */}
                    <AnimatePresence>
                        {selectedNode && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-800 overflow-hidden"
                            >
                                <div className="px-5 py-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-white mb-1">{selectedNode.label}</h3>
                                            <p className="text-xs text-gray-400 leading-relaxed">{selectedNode.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0 text-[10px]">
                                            <span className="text-gray-500">{selectedNode.bloom_level}</span>
                                            <span className="text-gray-500">{selectedNode.estimated_hours}h est.</span>
                                            <span className={`font-bold ${
                                                selectedNode.status === 'completed' ? 'text-green-400' :
                                                selectedNode.status === 'recommended_next' ? 'text-purple-400' :
                                                selectedNode.status === 'in_progress' ? 'text-blue-400' :
                                                'text-gray-500'
                                            }`}>
                                                {(selectedNode.status || '').replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedNode.key_concepts?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {selectedNode.key_concepts.map((c, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-800 border border-gray-700/50 rounded-full text-[10px] text-gray-400">{c}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Tabbed Panel */}
                <div className="w-[420px] flex-shrink-0 flex flex-col bg-gray-900/50">
                    {/* Tab Bar */}
                    <div className="flex border-b border-gray-800">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all relative ${
                                    activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-400'
                                }`}
                            >
                                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? tab.color : ''}`} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="tab-indicator"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {activeTab === 'recommendations' && (
                                <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    {loading.recommendations ? (
                                        <LoadingState message="Generating recommendations..." subMessage="Analyzing your knowledge gaps" />
                                    ) : (
                                        <RecommendationList recommendations={recommendations} />
                                    )}
                                </motion.div>
                            )}
                            {activeTab === 'practice' && (
                                <motion.div key="prac" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <PracticePanel practiceData={practiceData} loading={loading.practice} />
                                </motion.div>
                            )}
                            {activeTab === 'resources' && (
                                <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <ResourcePanel resourceData={resourceData} loading={loading.resources} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
