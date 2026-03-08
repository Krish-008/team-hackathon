const mongoose = require('mongoose');
require('dotenv').config();
const Quest = require('./models/Quest');
const Document = require('./models/Document');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.\n");

        const quests = await Quest.find({}).lean();
        const documents = await Document.find({}).lean();

        // Group by user ID
        const users = {};
        
        quests.forEach(q => {
            if (!users[q.userId]) users[q.userId] = { quests: [], documents: [] };
            users[q.userId].quests.push({
                topic: q.topic,
                skillLevel: q.skillLevel,
                savedAt: q.timestamp,
                nodesCount: q.mapData?.nodes?.length || 0
            });
        });

        documents.forEach(d => {
            if (!users[d.userId]) users[d.userId] = { quests: [], documents: [] };
            users[d.userId].documents.push({
                filename: d.filename,
                category: d.category,
                size: (d.fileSize / 1024).toFixed(2) + ' KB',
                chunks: d.chunkCount,
                uploadedAt: d.uploadedAt
            });
        });

        console.log(JSON.stringify(users, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
