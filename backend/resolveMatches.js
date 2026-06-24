const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/footballverse', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');

  // Load models (assuming they match the schemas)
  const userSchema = new mongoose.Schema({
    xp: { type: Number, default: 0 },
    stats: { type: Object, default: {} },
    predictionStats: { type: Object, default: {} }
  }, { strict: false });
  const User = mongoose.model('User', userSchema);

  const betSchema = new mongoose.Schema({
    userId: String,
    matchId: String,
    type: String,
    wager: Number,
    odds: Number,
    status: String
  }, { strict: false });
  const UserBet = mongoose.model('UserBet', betSchema);

  const matchSchema = new mongoose.Schema({
    status: String,
    homeScore: Number,
    awayScore: Number
  }, { strict: false });
  const PredictionMatch = mongoose.model('PredictionMatch', matchSchema);

  const finishedMatches = await PredictionMatch.find({ status: 'FINISHED' });
  console.log(`Found ${finishedMatches.length} finished matches.`);

  for (const match of finishedMatches) {
    console.log(`Resolving match ${match._id}...`);
    let actualOutcome;
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;
    if (homeScore > awayScore) actualOutcome = 'HOME_WIN';
    else if (homeScore < awayScore) actualOutcome = 'AWAY_WIN';
    else actualOutcome = 'DRAW';

    const pendingBets = await UserBet.find({ matchId: match._id.toString(), status: 'PENDING' });
    console.log(`  Found ${pendingBets.length} pending bets for this match.`);

    for (const bet of pendingBets) {
      const isWin = bet.type === actualOutcome;
      bet.status = isWin ? 'WON' : 'LOST';
      await bet.save();

      const user = await User.findById(bet.userId);
      if (user) {
        user.predictionStats = user.predictionStats || { total: 0, correct: 0, accuracy: 0, streak: 0, bestStreak: 0, xpEarned: 0 };
        user.predictionStats.total += 1;
        
        if (isWin) {
          const winnings = Math.floor(bet.wager * bet.odds);
          user.xp += winnings;
          user.predictionStats.correct += 1;
          user.predictionStats.xpEarned += winnings;
          
          user.stats = user.stats || { posts: 0, comments: 0, correctPredictions: 0, matchesWatched: 0 };
          user.stats.correctPredictions += 1;
          
          user.predictionStats.streak += 1;
          if (user.predictionStats.streak > user.predictionStats.bestStreak) {
             user.predictionStats.bestStreak = user.predictionStats.streak;
          }
        } else {
          user.predictionStats.streak = 0;
        }

        if (user.predictionStats.total > 0) {
          user.predictionStats.accuracy = Math.round((user.predictionStats.correct / user.predictionStats.total) * 100);
        }
        
        user.markModified('predictionStats');
        user.markModified('stats');
        await user.save();
        console.log(`  Processed bet for user ${user._id}: ${isWin ? 'WON' : 'LOST'}`);
      }
    }
    
    match.status = 'RESOLVED';
    await match.save();
    console.log(`  Match ${match._id} set to RESOLVED.`);
  }

  console.log('Done.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
