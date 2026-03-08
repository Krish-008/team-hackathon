const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

const SYSTEM_PERSONA = `You are QuestMap AI — a professional learning coach with deep expertise in curriculum design, Bloom's taxonomy, and personalized education. You always think step-by-step about WHY a recommendation suits the learner before making it. You never hallucinate URLs. When suggesting YouTube videos, you provide realistic search queries and estimated timestamp ranges based on typical tutorial structure, not fabricated links.`;

/**
 * Resolve a YouTube search query into a real video URL + title by scraping YouTube search results.
 * Parses ytInitialData JSON to get real videoId, title, and channel.
 * Falls back to YouTube search URL if scraping fails.
 */
async function resolveYouTubeVideo(searchQuery) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
            {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        );
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`YouTube returned ${res.status}`);
        
        const html = await res.text();
        
        // Try to parse ytInitialData for accurate title + channel
        const initDataMatch = html.match(/var ytInitialData = ({.*?});/s);
        if (initDataMatch) {
            try {
                const data = JSON.parse(initDataMatch[1]);
                const contents = data?.contents?.twoColumnSearchResultsRenderer
                    ?.primaryContents?.sectionListRenderer?.contents?.[0]
                    ?.itemSectionRenderer?.contents || [];
                
                for (const item of contents) {
                    const video = item.videoRenderer;
                    if (video?.videoId) {
                        return {
                            url: `https://www.youtube.com/watch?v=${video.videoId}`,
                            realTitle: video.title?.runs?.[0]?.text || null,
                            realChannel: video.ownerText?.runs?.[0]?.text || null,
                        };
                    }
                }
            } catch { /* fall through to regex approach */ }
        }
        
        // Fallback: regex for videoId only
        const matches = [...html.matchAll(/"videoId":"([^"]+)"/g)];
        const uniqueIds = [...new Set(matches.map(m => m[1]))];
        if (uniqueIds.length > 0) {
            return { url: `https://www.youtube.com/watch?v=${uniqueIds[0]}`, realTitle: null, realChannel: null };
        }
    } catch (err) {
        console.warn(`YouTube resolve failed for "${searchQuery}":`, err.message);
    }
    return { url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, realTitle: null, realChannel: null };
}

/**
 * Resolve all YouTube search queries in resource data to real video URLs + titles.
 */
async function resolveYouTubeUrls(resourceData) {
    if (!resourceData?.youtube_videos?.length) return resourceData;
    
    const resolved = await Promise.all(
        resourceData.youtube_videos.map(async (video) => {
            const query = video.search_query || `${video.channel || ''} ${video.title || ''}`.trim();
            const result = await resolveYouTubeVideo(query);
            return {
                ...video,
                url: result.url,
                title: result.realTitle || video.title,           // Use real title if available
                channel: result.realChannel || video.channel,     // Use real channel if available
                search_query: query,
            };
        })
    );
    
    return { ...resourceData, youtube_videos: resolved };
}

/**
 * Resolve an article search query into a real URL by scraping DuckDuckGo HTML search results.
 * Extracts the first real result URL from the page.
 */
async function resolveArticleUrl(searchQuery) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(
            `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`,
            {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            }
        );
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`DuckDuckGo returned ${res.status}`);
        
        const html = await res.text();
        // DDG HTML puts result links in class="result__a" href="..."
        const resultLinks = [...html.matchAll(/class="result__a"[^>]*href="([^"]+)"/g)];
        
        for (const match of resultLinks) {
            let url = match[1];
            // DDG sometimes wraps URLs in //duckduckgo.com/l/?uddg=...
            if (url.includes('uddg=')) {
                url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
            }
            // Skip google/youtube/DDG internal links
            if (!url.includes('google.com') && !url.includes('youtube.com') && !url.includes('duckduckgo.com')) {
                return url;
            }
        }
    } catch (err) {
        console.warn(`Article URL resolve failed for "${searchQuery}":`, err.message);
    }
    // Fallback: Google search URL
    return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

/**
 * Resolve all article search queries in resource data to real article URLs.
 */
async function resolveArticleUrls(resourceData) {
    if (!resourceData?.articles?.length) return resourceData;
    
    const resolved = await Promise.all(
        resourceData.articles.map(async (article) => {
            const query = article.search_query || `${article.title || ''} ${article.source || ''}`.trim();
            const resolvedUrl = await resolveArticleUrl(query);
            return { ...article, url: resolvedUrl, search_query: query };
        })
    );
    
    return { ...resourceData, articles: resolved };
}

/**
 * Call Gemini with a prompt and return parsed JSON.
 * Uses responseMimeType for guaranteed structured output.
 */
async function callGemini(prompt, retries = 2) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
        },
    });

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            let text = result.response.text();
            text = text.replace(/```json|```/g, '').trim();
            return JSON.parse(text);
        } catch (err) {
            if (attempt === retries) throw err;
            console.warn(`Gemini attempt ${attempt + 1} failed, retrying...`);
        }
    }
}

// ─── Health Check ───────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
    res.json({ status: 'QuestMap Backend is Running', timestamp: new Date() });
});

// ─── 1. Generate Profile & Synthetic Learning History ───────────────────────

app.post('/api/generate-profile', async (req, res) => {
    const { topic, skill_level, background, goals } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `${SYSTEM_PERSONA}

The learner wants to study: "${topic}"
Skill level: "${skill_level || 'beginner'}"
Professional background: "${background || 'Not specified'}"
Learning goals: "${goals || 'General mastery of the topic'}"

Your task: Generate a realistic synthetic learning history for this learner that would come from a learning app. Think step-by-step:
1. Based on their skill level, determine what they would have ALREADY learned
2. Based on their background, infer what adjacent skills they possess
3. Generate realistic data including completion percentages, quiz scores, and time invested

Return valid JSON matching this exact schema:
{
    "learner_summary": "A 2-3 sentence summary of the learner's profile and where they stand",
    "inferred_skills": ["skill1", "skill2"],
    "learning_history": [
        {
            "topic": "Topic they previously studied",
            "status": "completed | in_progress | abandoned",
            "completion_percent": 85,
            "quiz_score": 78,
            "hours_spent": 12,
            "date_completed": "2025-11-15"
        }
    ],
    "strengths": ["strength1", "strength2"],
    "knowledge_gaps": ["gap1", "gap2"],
    "recommended_pace": "aggressive | moderate | gentle",
    "estimated_total_hours": 40
}

Generate 5-8 learning history entries that would realistically precede studying "${topic}" at a "${skill_level || 'beginner'}" level. Make the data coherent with their background.`;

    try {
        console.log(`[${new Date().toISOString()}] Profile generation for: "${topic}"`);
        const json = await callGemini(prompt);
        console.log(`[${new Date().toISOString()}] Profile generated successfully.`);
        res.json(json);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Profile Error:`, error.message);
        res.status(500).json({ error: 'Failed to generate profile', details: error.message });
    }
});

// ─── 2. Generate Knowledge Map (Enhanced) ───────────────────────────────────

app.post('/api/generate-map', async (req, res) => {
    const { topic, skill_level, background, goals, learning_history } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const historyContext = learning_history
        ? `\nThe learner's past learning history:\n${JSON.stringify(learning_history, null, 2)}`
        : '';

    const prompt = `${SYSTEM_PERSONA}

The learner wants to master: "${topic}"
Skill level: "${skill_level || 'beginner'}"
Background: "${background || 'Not specified'}"
Goals: "${goals || 'General mastery'}"
${historyContext}

Create a comprehensive, personalized knowledge map for learning "${topic}". Think step-by-step:
1. Identify the 8-10 core sub-topics needed to master this subject
2. Determine the logical learning order (prerequisites first)
3. Assign a Bloom's taxonomy level to each node
4. Based on the learner's history, mark which topics they may have partially covered
5. Estimate realistic time investment for each topic

Return valid JSON matching this exact schema:
{
    "map_title": "Learning Path: ${topic}",
    "total_estimated_hours": 60,
    "nodes": [
        {
            "id": "1",
            "label": "Topic Name",
            "description": "What this covers and why it matters",
            "bloom_level": "Remember | Understand | Apply | Analyze | Evaluate | Create",
            "difficulty": "beginner | intermediate | advanced",
            "estimated_hours": 5,
            "status": "completed | in_progress | not_started | recommended_next",
            "key_concepts": ["concept1", "concept2", "concept3"],
            "prerequisites": []
        }
    ],
    "edges": [
        {
            "source": "1",
            "target": "2",
            "relationship": "prerequisite | recommended | optional"
        }
    ]
}

Mark 1-2 nodes as "recommended_next" — these are what the learner should focus on NOW. Nodes they likely already know (based on history) should be "completed". Ensure the graph is a connected DAG.`;

    try {
        console.log(`[${new Date().toISOString()}] Map generation for: "${topic}"`);
        const json = await callGemini(prompt);
        console.log(`[${new Date().toISOString()}] Map generated with ${json.nodes?.length} nodes.`);
        res.json(json);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Map Error:`, error.message);
        res.status(500).json({ error: 'Failed to generate map', details: error.message });
    }
});

// ─── 3. Generate Personalized Recommendations ──────────────────────────────

app.post('/api/generate-recommendations', async (req, res) => {
    const { topic, skill_level, background, goals, learning_history, knowledge_gaps } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `${SYSTEM_PERSONA}

The learner is studying: "${topic}"
Skill level: "${skill_level || 'beginner'}"
Background: "${background || 'Not specified'}"
Goals: "${goals || 'General mastery'}"
Known knowledge gaps: ${JSON.stringify(knowledge_gaps || [])}
Learning history summary: ${JSON.stringify(learning_history || [])}

Generate personalized next-step learning recommendations. For EACH recommendation, you MUST:
1. First REASON about why this is appropriate given their specific background and history
2. Then provide the recommendation with clear reasoning the learner can understand
3. Tie the reason to specific evidence from their profile (e.g., "Since you completed X, you're ready for Y")

Return valid JSON matching this exact schema:
{
    "recommendations": [
        {
            "id": 1,
            "priority": "high | medium | low",
            "title": "What to learn next",
            "description": "Detailed description of this learning step",
            "reason": "Specific, personalized reason WHY this is recommended NOW, referencing their history/gaps",
            "estimated_hours": 4,
            "difficulty": "beginner | intermediate | advanced",
            "prerequisites_met": true,
            "related_to_goal": "Which of their goals this serves"
        }
    ]
}

Generate exactly 6 recommendations ordered by priority. At least 2 must be "high" priority.`;

    try {
        console.log(`[${new Date().toISOString()}] Recommendations for: "${topic}"`);
        const json = await callGemini(prompt);
        console.log(`[${new Date().toISOString()}] Generated ${json.recommendations?.length} recommendations.`);
        res.json(json);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Recommendations Error:`, error.message);
        res.status(500).json({ error: 'Failed to generate recommendations', details: error.message });
    }
});

// ─── 4. Generate Practice Scenarios ─────────────────────────────────────────

app.post('/api/generate-practice', async (req, res) => {
    const { topic, node_label, skill_level, key_concepts } = req.body;

    if (!topic || !node_label) {
        return res.status(400).json({ error: 'Topic and node_label are required' });
    }

    const prompt = `${SYSTEM_PERSONA}

The learner is studying "${topic}" and is currently on the sub-topic: "${node_label}"
Skill level: "${skill_level || 'beginner'}"
Key concepts to test: ${JSON.stringify(key_concepts || [])}

Generate practice scenarios to test and reinforce their understanding. Include a MIX of question types. Think step-by-step:
1. What are the most important concepts the learner must understand here?
2. What common misconceptions exist?
3. Design questions that test understanding, not just memorization

Return valid JSON matching this exact schema:
{
    "practice_title": "Practice: ${node_label}",
    "scenarios": [
        {
            "id": 1,
            "type": "multiple_choice",
            "difficulty": "beginner | intermediate | advanced",
            "question": "Clear, specific question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0,
            "explanation": "Detailed explanation of why this is correct and why other options are wrong"
        },
        {
            "id": 2,
            "type": "scenario",
            "difficulty": "intermediate",
            "question": "A real-world scenario the learner must analyze",
            "context": "Background context for the scenario",
            "solution": "Step-by-step solution with reasoning",
            "key_takeaway": "What the learner should remember from this"
        },
        {
            "id": 3,
            "type": "code_challenge",
            "difficulty": "intermediate",
            "question": "A coding task description",
            "starter_code": "// Starting code or pseudocode",
            "solution_code": "// Complete solution",
            "explanation": "Why this solution works"
        }
    ]
}

Generate exactly 5 scenarios: 2 multiple_choice, 2 scenario, 1 code_challenge. Ensure they progress in difficulty.`;

    try {
        console.log(`[${new Date().toISOString()}] Practice for: "${node_label}"`);
        const json = await callGemini(prompt);
        console.log(`[${new Date().toISOString()}] Generated ${json.scenarios?.length} practice scenarios.`);
        res.json(json);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Practice Error:`, error.message);
        res.status(500).json({ error: 'Failed to generate practice', details: error.message });
    }
});

// ─── 5. Generate External Resources (YouTube Snippets + Articles) ──────────

app.post('/api/generate-resources', async (req, res) => {
    const { topic, node_label, skill_level } = req.body;

    if (!topic || !node_label) {
        return res.status(400).json({ error: 'Topic and node_label are required' });
    }

    const prompt = `${SYSTEM_PERSONA}

The learner is studying "${topic}", specifically the sub-topic: "${node_label}"
Skill level: "${skill_level || 'beginner'}"

Recommend external learning resources.

CRITICAL RULES FOR YOUTUBE:
- Do NOT provide direct YouTube video URLs — they are often wrong.
- Instead, for each video provide a "search_query" that is VERY SPECIFIC: include the exact channel name AND a distinctive phrase from the video title. Example: "freeCodeCamp reinforcement learning full course 2024" or "3Blue1Brown neural networks chapter 1".
- The search query should be specific enough that the FIRST YouTube search result is the correct video.
- Provide estimated timestamp ranges for the most relevant section.

CRITICAL RULES FOR ARTICLES:
- Do NOT provide direct article URLs — they are often wrong and return 404 errors.
- Instead, provide the article title, the source website name, and a specific search_query that will find the actual article.
- Example: source "MDN Web Docs", search_query "MDN Array.prototype.map JavaScript"

Think step-by-step:
1. What are the best-known YouTube videos for this topic from channels like 3Blue1Brown, Fireship, Traversy Media, freeCodeCamp, Sentdex, Tech With Tim, The Coding Train, etc.?
2. What specific timestamp section covers this sub-topic?
3. What official documentation or tutorial articles are most relevant?

Return valid JSON matching this exact schema:
{
    "resources_for": "${node_label}",
    "youtube_videos": [
        {
            "id": 1,
            "search_query": "very specific YouTube search query including channel name and video title keywords",
            "channel": "Exact channel name",
            "title": "Exact or near-exact video title",
            "why_relevant": "Why this video helps with this specific sub-topic",
            "snippet_timestamp": "3:24 - 7:15",
            "snippet_description": "What is covered in this specific timestamp range",
            "skill_level": "beginner | intermediate | advanced"
        }
    ],
    "articles": [
        {
            "id": 1,
            "source": "Name of the site (e.g., MDN Web Docs, Official React Docs, GeeksforGeeks)",
            "search_query": "Specific search query to find this article on Google",
            "title": "Article or doc page title",
            "why_relevant": "How this article helps",
            "key_takeaway": "The one thing to learn from this resource",
            "estimated_read_time": "8 min"
        }
    ],
    "books": [
        {
            "title": "Book title",
            "author": "Author name",
            "relevant_chapter": "Chapter or section most relevant",
            "why_relevant": "Why this book helps"
        }
    ]
}

Provide exactly 4 YouTube videos, 3 articles, and 2 books.`;

    try {
        console.log(`[${new Date().toISOString()}] Resources for: "${node_label}"`);
        const json = await callGemini(prompt);
        console.log(`[${new Date().toISOString()}] Generated resources: ${json.youtube_videos?.length} videos, ${json.articles?.length} articles.`);
        
        // Resolve YouTube + Article search queries to real URLs (in parallel)
        console.log(`[${new Date().toISOString()}] Resolving resource URLs...`);
        const withYouTube = await resolveYouTubeUrls(json);
        const withArticles = await resolveArticleUrls(withYouTube);
        console.log(`[${new Date().toISOString()}] All resource URLs resolved.`);
        res.json(withArticles);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Resources Error:`, error.message);
        res.status(500).json({ error: 'Failed to generate resources', details: error.message });
    }
});

// ─── Start Server ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`QuestMap API running on port ${PORT}`);
});

module.exports = app;