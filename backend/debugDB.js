const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/football-social-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  const matchCol = mongoose.connection.db.collection('predictionmatches');
  const allMatches = await matchCol.find({}).toArray();
  console.log(`Total matches: ${allMatches.length}`);
  if (allMatches.length > 0) {
    const statuses = new Set(allMatches.map(m => m.status));
    console.log('Statuses found:', Array.from(statuses));
  }

  process.exit(0);
});
