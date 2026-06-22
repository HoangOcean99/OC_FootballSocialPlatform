import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import axios from 'axios';

const ESPN_LEAGUES = [
  'eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1',
  'uefa.champions', 'uefa.euro', 'fifa.world',
  'conmebol.america', 'fifa.friendly', 'usa.1', 'jpn.1', 'kor.1'
];
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PredictionMatch, PredictionMatchDocument } from './prediction-match.schema';
import { UserBet, UserBetDocument } from './user-bet.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(PredictionMatch.name) private predMatchModel: Model<PredictionMatchDocument>,
    @InjectModel(UserBet.name) private userBetModel: Model<UserBetDocument>,
    private usersService: UsersService,
  ) {}

  async getActivePredictions() {
    return this.predMatchModel.find({ status: { $ne: 'RESOLVED' } }).exec();
  }

  async getPredictionsByDate(dateStr: string) {
    try {
      const promises = ESPN_LEAGUES.map((league) => 
        axios.get(`http://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${dateStr}`)
      );
      
      const results = await Promise.allSettled(promises);
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.data?.events) {
          const compName = result.value.data.leagues[0].name;
          
          for (const event of result.value.data.events) {
            const home = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
            const away = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
            const statusType = event.status.type.state; // 'pre', 'in', 'post'
            
            let mappedStatus = 'OPEN';
            if (statusType === 'in') mappedStatus = 'LIVE';
            else if (statusType === 'post') mappedStatus = 'FINISHED';
            
            const homeScore = parseInt(home.score) || 0;
            const awayScore = parseInt(away.score) || 0;
            
            const matchQuery = { 
              homeTeam: home.team.name, 
              awayTeam: away.team.name, 
              kickoff: event.date 
            };
            
            try {
              const existing = await this.predMatchModel.findOne(matchQuery).exec();
              
              if (existing) {
                let updated = false;
                if (existing.status !== mappedStatus || existing.homeScore !== homeScore || existing.awayScore !== awayScore) {
                  // Keep OPEN if it hasn't started, don't revert RESOLVED
                  if (existing.status !== 'RESOLVED') {
                    existing.status = mappedStatus as any;
                    if (mappedStatus === 'FINISHED' || mappedStatus === 'LIVE') {
                      existing.homeScore = homeScore;
                      existing.awayScore = awayScore;
                    }
                    updated = true;
                  }
                }
                
                // Force update logos if missing
                if (!existing.homeLogo || existing.homeLogo !== home.team.logo) {
                  existing.homeLogo = home.team.logo;
                  existing.awayLogo = away.team.logo;
                  updated = true;
                }
                
                // Fix old data without emojis that cause ValidationError
                if (!existing.homeEmoji) { existing.homeEmoji = '🏠'; updated = true; }
                if (!existing.awayEmoji) { existing.awayEmoji = '✈️'; updated = true; }
                
                if (updated) {
                  await existing.save();
                }
              } else {
              // Create new
              const baseHome = 1.5 + Math.random() * 2;
              const baseAway = 1.5 + Math.random() * 2;
              const baseDraw = 2.5 + Math.random() * 1.5;
              
              await this.predMatchModel.create({
                ...matchQuery,
                competition: compName,
                status: mappedStatus,
                homeOdds: parseFloat(baseHome.toFixed(2)),
                drawOdds: parseFloat(baseDraw.toFixed(2)),
                awayOdds: parseFloat(baseAway.toFixed(2)),
                homeEmoji: '🏠', // Default if no logo
                awayEmoji: '✈️', // Default
                homeLogo: home.team.logo,
                awayLogo: away.team.logo,
                xpReward: 1000,
                ...(mappedStatus === 'FINISHED' || mappedStatus === 'LIVE' ? { homeScore, awayScore } : {})
              });
              }
            } catch (err) {
              console.error('Error syncing individual match:', matchQuery.homeTeam, err);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error syncing predictions from ESPN:', e);
    }
    
    // Return all matches within a 4-day window to ensure timezone shifts are covered
    const targetYear = parseInt(dateStr.slice(0,4));
    const targetMonth = parseInt(dateStr.slice(4,6)) - 1; // 0-indexed
    const targetDay = parseInt(dateStr.slice(6,8));
    
    const start = new Date(Date.UTC(targetYear, targetMonth, targetDay - 2));
    const end = new Date(Date.UTC(targetYear, targetMonth, targetDay + 2));
    
    return this.predMatchModel.find({ 
      kickoff: { 
        $gte: start.toISOString(),
        $lt: end.toISOString()
      } 
    }).exec();
  }

  async placeBet(userId: string, matchId: string, type: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | 'EXACT_SCORE', wager: number) {
    if (wager <= 0) throw new BadRequestException('Wager must be positive');
    
    const match = await this.predMatchModel.findById(matchId).exec();
    if (!match) throw new NotFoundException('Match not found');
    if (match.status !== 'OPEN') throw new BadRequestException('Match is closed for betting');

    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    let odds = 1.0;
    if (type === 'HOME_WIN') odds = match.homeOdds;
    else if (type === 'DRAW') odds = match.drawOdds;
    else if (type === 'AWAY_WIN') odds = match.awayOdds;
    else if (type === 'EXACT_SCORE') odds = match.homeOdds * 3; // Mock exact score odds

    // Check if existing bet
    const existingBet = await this.userBetModel.findOne({ userId, matchId }).exec();

    // Check prediction limits for NEW bets
    if (!existingBet) {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      if (user.lastPredictionDate !== todayDateStr) {
        user.dailyPredictionsCount = 0;
        user.lastPredictionDate = todayDateStr;
      }

      if (user.dailyPredictionsCount >= 3) {
        if (user.extraPredictions > 0) {
          user.extraPredictions -= 1;
        } else {
          throw new BadRequestException('Hết lượt dự đoán trong ngày. Vui lòng mua thêm tại Cửa hàng!');
        }
      }
      user.dailyPredictionsCount += 1;
    }

    const currentXp = user.xp || 0;
    const previousWager = existingBet ? existingBet.wager : 0;
    
    const netCost = wager - previousWager;
    if (currentXp < netCost) {
      throw new BadRequestException('Số dư XP không đủ');
    }

    // Deduct/Refund net cost
    user.xp = currentXp - netCost;
    await user.save();

    if (existingBet) {
      existingBet.type = type;
      existingBet.wager = wager;
      existingBet.odds = odds;
      return existingBet.save();
    } else {
      const newBet = new this.userBetModel({
        userId,
        matchId,
        type,
        wager,
        odds,
        status: 'PENDING',
      });
      return newBet.save();
    }
  }

  async getMyBets(userId: string) {
    return this.userBetModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }
}
