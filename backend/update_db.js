const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/footballverse').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('competitions').updateMany({ name: 'Euro 2024' }, { $set: { name: 'Euro' } });
  await db.collection('competitions').updateMany({ name: 'World Cup 2022' }, { $set: { name: 'World Cup' } });
  console.log('Updated DB');
  mongoose.disconnect();
});
