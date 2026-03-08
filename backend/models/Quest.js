const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  topic: { type: String, required: true },
  skillLevel: { type: String, required: true },
  profileData: { type: Object },
  mapData: { type: Object },
  recommendations: { type: Array },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quest', QuestSchema);
