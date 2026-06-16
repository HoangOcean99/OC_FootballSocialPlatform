const mongoose = require('mongoose');

const logoMap = {
  'Ngoại hạng Anh': 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png',
  'La Liga': 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
  'Serie A': 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png',
  'Bundesliga': 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png',
  'Ligue 1': 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png',
  'Champions League': 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
  'Euro': 'https://a.espncdn.com/i/leaguelogos/soccer/500/6.png',
  'Copa America': 'https://a.espncdn.com/i/leaguelogos/soccer/500/83.png',
  'World Cup': 'https://a.espncdn.com/i/leaguelogos/soccer/500/4.png'
};

mongoose.connect('mongodb://localhost:27017/footballverse').then(async () => {
  const db = mongoose.connection.db;
  for (const [name, logo] of Object.entries(logoMap)) {
    await db.collection('competitions').updateMany({ name }, { $set: { logo } });
  }
  console.log('Updated DB Logos');
  mongoose.disconnect();
}).catch(e => {
  console.error(e);
  mongoose.disconnect();
});
