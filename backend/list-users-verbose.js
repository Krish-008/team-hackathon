const mongoose = require('mongoose');
require('dotenv').config();
const Document = require('./models/Document');
const Quest = require('./models/Quest');

async function run() {
    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const questCount = await Quest.countDocuments();
        const docCount = await Document.countDocuments();
        
        console.log(`Total Quests in DB: ${questCount}`);
        console.log(`Total Documents in DB: ${docCount}`);

        const allQuests = await Quest.find().sort({ timestamp: -1 }).limit(10);
        console.log('\n--- RECENT QUESTS ---');
        allQuests.forEach(q => {
            console.log(`- User: ${q.userId} | Topic: ${q.topic} | Skill: ${q.skillLevel} | Date: ${q.timestamp}`);
        });

        const allDocs = await Document.find().sort({ uploadedAt: -1 }).limit(10);
        console.log('\n--- RECENT DOCUMENTS ---');
        allDocs.forEach(d => {
            console.log(`- User: ${d.userId} | File: ${d.filename} | Category: ${d.category} | Status: ${d.status}`);
        });

    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}
run();
