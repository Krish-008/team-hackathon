import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, BookOpen, Library, Clock, ExternalLink, Search, Play } from 'lucide-react';

// Helper: open URL in new tab without affecting current page state
const openLink = (url, e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    window.open(url, '_blank', 'noopener,noreferrer');
};

// ─── YouTube Video Card ─────────────────────────────────────────────────────

const YouTubeCard = ({ video, index }) => {
    const searchQuery = video.search_query || `${video.channel || ''} ${video.title || ''}`.trim();
    const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    // Backend resolves real video URLs via Piped API; fallback to search
    const videoUrl = video.url || fallbackUrl;
    const isDirect = video.url && video.url.includes('watch?v=');

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={(e) => openLink(videoUrl, e)}
            className="block bg-gray-800/50 border border-gray-700/40 rounded-2xl p-4 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5 transition-all group cursor-pointer"
        >
            {/* Thumbnail-like header */}
            <div className="bg-gradient-to-br from-red-500/10 to-red-900/20 rounded-xl p-3 mb-3 flex items-center gap-3 relative overflow-hidden">
                <div className="bg-red-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                    <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate group-hover:text-red-300 transition-colors">
                        {video.title}
                    </p>
                    <p className="text-gray-500 text-[10px]">{video.channel || video.suggested_channel}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-red-400 transition-colors flex-shrink-0" />
            </div>

            {/* Timestamp Snippet — the key differentiator */}
            {video.snippet_timestamp && (
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2 mb-2.5">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span className="text-red-400 text-[11px] font-mono font-bold">{video.snippet_timestamp}</span>
                    </div>
                    <p className="text-gray-400 text-[10px] mt-1 leading-relaxed">
                        {video.snippet_description}
                    </p>
                </div>
            )}

            {/* Why relevant */}
            <p className="text-gray-500 text-[10px] leading-relaxed mb-2">{video.why_relevant}</p>

            {/* Link type indicator */}
            <div className="flex items-center gap-1.5 text-[9px] text-gray-600">
                {isDirect ? (
                    <><Play className="w-2.5 h-2.5 text-green-500" /><span className="font-mono truncate text-green-600">Direct video link</span></>
                ) : (
                    <><Search className="w-2.5 h-2.5" /><span className="font-mono truncate">{searchQuery}</span></>
                )}
            </div>
        </motion.div>
    );
};

// ─── Article Card ───────────────────────────────────────────────────────────

const ArticleCard = ({ article, index }) => {
    // Backend resolves real article URLs via DuckDuckGo; fallback to Google search
    const searchTerm = article.search_query || `${article.title || ''} ${article.source || ''}`.trim();
    const articleUrl = article.url || `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
    const isDirect = article.url && !article.url.includes('google.com/search');

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.08 }}
            onClick={(e) => openLink(articleUrl, e)}
            className="block bg-gray-800/50 border border-gray-700/40 rounded-2xl p-4 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group cursor-pointer"
        >
            <div className="flex items-start gap-3">
                <div className="bg-blue-600/20 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold group-hover:text-blue-300 transition-colors truncate">
                        {article.title}
                    </p>
                    <p className="text-gray-500 text-[10px]">{article.source}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
            </div>

            <p className="text-gray-400 text-[10px] leading-relaxed mt-2">{article.why_relevant}</p>

            <div className="flex items-center justify-between mt-2.5">
                {article.key_takeaway && (
                    <p className="text-blue-400/70 text-[10px] italic flex-1 mr-3">💡 {article.key_takeaway}</p>
                )}
                {article.estimated_read_time && (
                    <span className="text-gray-600 text-[10px] flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        {article.estimated_read_time}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

// ─── Book Card ──────────────────────────────────────────────────────────────

const BookCard = ({ book, index }) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(book.title + ' ' + book.author + ' book')}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.08 }}
            onClick={(e) => openLink(searchUrl, e)}
            className="block bg-gray-800/50 border border-gray-700/40 rounded-2xl p-4 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all group cursor-pointer"
        >
            <div className="flex items-start gap-3">
                <div className="bg-purple-600/20 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Library className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold group-hover:text-purple-300 transition-colors">
                        {book.title}
                    </p>
                    <p className="text-gray-500 text-[10px]">by {book.author}</p>
                </div>
            </div>
            {book.relevant_chapter && (
                <p className="text-purple-400/60 text-[10px] mt-2">📖 {book.relevant_chapter}</p>
            )}
            <p className="text-gray-500 text-[10px] leading-relaxed mt-1">{book.why_relevant}</p>
        </motion.div>
    );
};

// ─── Main Panel ─────────────────────────────────────────────────────────────

const ResourcePanel = ({ resourceData, loading }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse bg-gray-800/40 rounded-2xl h-28 border border-gray-700/30" />
                ))}
            </div>
        );
    }

    if (!resourceData) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Youtube className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm italic">Click a node to discover curated learning resources</p>
            </div>
        );
    }

    return (
        <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 custom-scrollbar">
            {/* YouTube Section */}
            {resourceData.youtube_videos?.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <h3 className="text-white font-bold text-sm">YouTube Snippets</h3>
                        <span className="text-gray-600 text-[10px]">({resourceData.youtube_videos.length})</span>
                    </div>
                    <div className="space-y-3">
                        {resourceData.youtube_videos.map((v, i) => (
                            <YouTubeCard key={v.id || i} video={v} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* Articles Section */}
            {resourceData.articles?.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <h3 className="text-white font-bold text-sm">Articles & Documentation</h3>
                        <span className="text-gray-600 text-[10px]">({resourceData.articles.length})</span>
                    </div>
                    <div className="space-y-3">
                        {resourceData.articles.map((a, i) => (
                            <ArticleCard key={a.id || i} article={a} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* Books Section */}
            {resourceData.books?.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Library className="w-4 h-4 text-purple-400" />
                        <h3 className="text-white font-bold text-sm">Recommended Books</h3>
                        <span className="text-gray-600 text-[10px]">({resourceData.books.length})</span>
                    </div>
                    <div className="space-y-3">
                        {resourceData.books.map((b, i) => (
                            <BookCard key={i} book={b} index={i} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcePanel;
