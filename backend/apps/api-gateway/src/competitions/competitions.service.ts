import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Competition, CompetitionDocument } from './competition.schema';
import axios from 'axios';
import Redis from 'ioredis';

@Injectable()
export class CompetitionsService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(@InjectModel(Competition.name) private compModel: Model<CompetitionDocument>) {}

  async onModuleInit() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_PASSWORD ? { servername: process.env.REDIS_HOST } : undefined,
    });

    try {
      const count = await this.compModel.countDocuments();
      if (count === 0) {
        const defaultCompetitions = [
          { name: 'Ngoại hạng Anh', shortName: 'EPL', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'Anh', season: '2024/2025', teamsCount: 20, followers: '2.5M', color: 'from-purple-600 to-pink-600' },
          { name: 'La Liga', shortName: 'La Liga', logo: '🇪🇸', country: 'Tây Ban Nha', season: '2024/2025', teamsCount: 20, followers: '1.8M', color: 'from-orange-500 to-red-500' },
          { name: 'Serie A', shortName: 'Serie A', logo: '🇮🇹', country: 'Ý', season: '2024/2025', teamsCount: 20, followers: '1.2M', color: 'from-blue-600 to-blue-800' },
          { name: 'Bundesliga', shortName: 'Bundesliga', logo: '🇩🇪', country: 'Đức', season: '2024/2025', teamsCount: 18, followers: '1.5M', color: 'from-red-600 to-black' },
          { name: 'Ligue 1', shortName: 'Ligue 1', logo: '🇫🇷', country: 'Pháp', season: '2024/2025', teamsCount: 18, followers: '900K', color: 'from-blue-400 to-blue-600' },
          { name: 'Champions League', shortName: 'UCL', logo: '⭐', country: 'Châu Âu', season: '2024', teamsCount: 36, followers: '5M', color: 'from-blue-800 to-indigo-900' },
          { name: 'Euro', shortName: 'Euro', logo: '🏆', country: 'Châu Âu', season: '2024', teamsCount: 24, followers: '10M', color: 'from-blue-500 to-teal-400' },
          { name: 'Copa America', shortName: 'Copa', logo: '🌎', country: 'Nam Mỹ', season: '2024', teamsCount: 16, followers: '3M', color: 'from-yellow-400 to-orange-500' },
          { name: 'World Cup', shortName: 'World Cup', logo: '🌍', country: 'Quốc tế', season: '2026', teamsCount: 32, followers: '5B', color: 'from-amber-600 to-red-900' }
        ];
        await this.compModel.insertMany(defaultCompetitions);
        console.log('Seeded default competitions');
      }
    } catch (e) {
      console.error('Failed to seed competitions:', e);
    }
  }

  onModuleDestroy() {
    if (this.redisClient) this.redisClient.quit();
  }

  async getTopCompetitions() {
    return this.compModel.find().limit(5).exec();
  }

  async getAllCompetitions() {
    return this.compModel.find().exec();
  }

  async getCompetitionById(id: string) {
    const comp = await this.compModel.findById(id).exec();
    if (!comp) throw new NotFoundException('Competition not found');
    return comp;
  }

  private getEspnSlug(compName: string): string | null {
    const map: Record<string, string> = {
      'Ngoại hạng Anh': 'eng.1',
      'La Liga': 'esp.1',
      'Serie A': 'ita.1',
      'Bundesliga': 'ger.1',
      'Ligue 1': 'fra.1',
      'Champions League': 'uefa.champions',
      'Cúp C1 Châu Âu': 'uefa.champions',
      'Euro 2024': 'uefa.euro',
      'Euro': 'uefa.euro',
      'Copa America': 'conmebol.america',
      'World Cup 2022': 'fifa.world',
      'World Cup': 'fifa.world',
    };
    return map[compName] || null;
  }

  async getCompetitionStandings(id: string, season?: string) {
    const comp = await this.getCompetitionById(id);
    const slug = this.getEspnSlug(comp.name);
    if (!slug) return [];

    const cacheKey = season ? `standings_${slug}_${season}` : `standings_${slug}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const url = `https://site.web.api.espn.com/apis/v2/sports/soccer/${slug}/standings${season ? `?season=${season}` : ''}`;
      const res = await axios.get(url);
      const children = res.data?.children || [];

      const formatted = children.map((child: any) => {
        const standings = child.standings?.entries || [];
        const entries = standings.map((entry: any) => {
          const stats = entry.stats || [];
          const getStat = (abbrev: string) => stats.find((s: any) => s.abbreviation === abbrev)?.value || 0;
          
          let color = entry.note?.color || '';
          if (color.toUpperCase() === '#81D6AC') color = '#10B981'; // Vibrant Green
          else if (color.toUpperCase() === '#B2BFD0') color = '#3B82F6'; // Vibrant Blue
          else if (color.toUpperCase() === '#C6D1E0') color = '#F59E0B'; // Vibrant Orange
          else if (color.toUpperCase() === '#FF7F84') color = '#EF4444'; // Vibrant Red

          return {
            rank: getStat('R') || 0,
            team: {
              id: entry.team.id,
              name: entry.team.displayName,
              shortName: entry.team.shortDisplayName,
              logo: entry.team.logos?.[0]?.href || '',
            },
            played: getStat('GP'),
            won: getStat('W'),
            drawn: getStat('D'),
            lost: getStat('L'),
            goalsFor: getStat('F'),
            goalsAgainst: getStat('A'),
            goalDifference: getStat('GD') > 0 ? `+${getStat('GD')}` : `${getStat('GD')}`,
            points: getStat('P'),
            form: entry.form || '',
            description: entry.note?.description || '',
            color: color,
          };
        });
        
        entries.sort((a: any, b: any) => {
          return a.rank - b.rank;
        });
        
        return {
          name: child.name,
          entries
        };
      });

      // Dynamic cross-group sorting for 3rd-placed teams (e.g. Best 8 advance in WC, Best 4 in Euro)
      const thirdPlacedTeams: any[] = [];
      formatted.forEach((group: any) => {
        const third = group.entries.find((e: any) => e.description && e.description.toLowerCase().includes('best'));
        if (third) {
          thirdPlacedTeams.push(third);
        }
      });
      
      if (thirdPlacedTeams.length > 0) {
        thirdPlacedTeams.sort((a, b) => {
          if (a.points !== b.points) return b.points - a.points;
          const gdA = parseInt(a.goalDifference.replace('+', '')) || 0;
          const gdB = parseInt(b.goalDifference.replace('+', '')) || 0;
          if (gdA !== gdB) return gdB - gdA;
          return b.goalsFor - a.goalsFor;
        });
        
        const match = thirdPlacedTeams[0].description.match(/Best (\d+)/i);
        const advanceCount = match ? parseInt(match[1]) : 0;
        
        if (advanceCount > 0 && advanceCount < thirdPlacedTeams.length) {
          for (let i = advanceCount; i < thirdPlacedTeams.length; i++) {
            thirdPlacedTeams[i].color = '';
            thirdPlacedTeams[i].description = '';
          }
        }
      }

      await this.redisClient.set(cacheKey, JSON.stringify(formatted), 'EX', 3600);
      return formatted;
    } catch (error: any) {
      console.error(`Error fetching standings for ${slug}:`, error.message);
      return [];
    }
  }

  async getCompetitionMatches(id: string, season?: string) {
    const comp = await this.getCompetitionById(id);
    const slug = this.getEspnSlug(comp.name);
    if (!slug) return [];

    const cacheKey = season ? `matches_${slug}_${season}` : `matches_${slug}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      let currentYear = season || new Date().getFullYear().toString();
      if (!season) {
        const nameMatch = comp.name.match(/20\d{2}/);
        if (nameMatch) {
          currentYear = nameMatch[0];
        } else if (comp.season) {
          currentYear = comp.season.substring(0, 4);
        }
      }
      
      const url = `http://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${currentYear}&limit=300`;
      const res = await axios.get(url);
      const events = res.data?.events || [];
      const formatted = events.map((event: any) => {
        const home = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
        const away = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
        const statusType = event.status.type.state;
        let status = 'SCHEDULED';
        if (statusType === 'in') status = 'LIVE';
        if (statusType === 'post') status = 'FINISHED';
        if (event.status.type.shortDetail === 'HT') status = 'HT';

        return {
          id: event.id,
          competition: comp.name,
          competitionLogo: comp.logo,
          homeTeam: {
            id: home.team.id,
            name: home.team.displayName,
            logo: home.team.logo || '',
          },
          awayTeam: {
            id: away.team.id,
            name: away.team.displayName,
            logo: away.team.logo || '',
          },
          homeScore: parseInt(home.score) || 0,
          awayScore: parseInt(away.score) || 0,
          kickoff: new Date(event.date),
          status,
          minute: Math.floor((event.status.clock || 0) / 60),
          round: event.season?.slug || event.competitions[0]?.notes?.[0]?.headline || '',
          note: event.competitions[0]?.notes?.[0]?.headline || '',
        };
      });

      await this.redisClient.set(cacheKey, JSON.stringify(formatted), 'EX', 300);
      return formatted;
    } catch (error: any) {
      console.error(`Error fetching matches for ${slug}:`, error.message);
      return [];
    }
  }
}
