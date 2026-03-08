const mongoose = require('mongoose');
require('dotenv').config();
const Document = require('./models/Document');
const Quest = require('./models/Quest');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- USER DATA SUMMARY ---');
        
        const docUsers = await Document.distinct('userId');
        const questUsers = await Quest.distinct('userId');
        const allUsers = [...new Set([...docUsers, ...questUsers])];
        
        console.log(`Total Unique Users: ${allUsers.length}`);
        
        for (const uid of allUsers) {
            const docCount = await Document.countDocuments({ userId: uid });
            const questCount = await Quest.countDocuments({ userId: uid });
            const latestQuest = await Quest.findOne({ userId: uid }).sort({ timestamp: -1 });
            
            console.log(`\nUser ID: ${uid}`);
            console.log(`- Documents: ${docCount}`);
            console.log(`- Quests: ${questCount}`);
            if (latestQuest) {
                console.log(`  - Latest Topic: ${latestQuest.topic}`);
                console.log(`  - Latest Skill: ${latestQuest.skillLevel}`);
                console.log(`  - Last Active: ${latestQuest.timestamp}`);
            }
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
