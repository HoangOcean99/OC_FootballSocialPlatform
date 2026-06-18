import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './match.schema';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Redis from 'ioredis';

const ESPN_LEAGUES = [
  'eng.1', // Ngoại hạng Anh
  'esp.1', // La Liga
  'ita.1', // Serie A
  'ger.1', // Bundesliga
  'fra.1', // Ligue 1
  'uefa.champions', // Cúp C1
  'uefa.euro', // Euro
  'fifa.world', // World Cup
  'conmebol.america', // Copa America
  'fifa.friendly', // Giao hữu Quốc tế
];

@Injectable()
export class MatchesService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: parseInt(this.configService.get<string>('REDIS_PORT') || '6379', 10),
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  private async getApiFootballEnrichment(dateStr: string) {
    const apiKey = this.configService.get<string>('RAPIDAPI_FOOTBALL_KEY');
    // If no API key is provided in .env, fallback gracefully to ESPN data
    if (!apiKey || apiKey.trim() === '') return null;

    const cacheKey = `api_football_enrich_vn_${dateStr}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
        headers: {
          'x-apisports-key': apiKey,
        },
        params: { date: dateStr }
      });
      
      const enrichmentMap: Record<string, any> = {};
      if (response.data?.response) {
        response.data.response.forEach((fixture: any) => {
          // Create fuzzy keys based on team names to match with ESPN
          const homeName = fixture.teams.home.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const awayName = fixture.teams.away.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matchKey = `${homeName}_${awayName}`;
          enrichmentMap[matchKey] = {
            round: fixture.league.round, // e.g. "Group A - 1"
            stadium: fixture.fixture.venue.name,
            referee: fixture.fixture.referee
          };
        });
      }
      
      // Cache for 24 hours to save API-Football requests (100 req/day limit)
      await this.redisClient.set(cacheKey, JSON.stringify(enrichmentMap), 'EX', 86400);
      return enrichmentMap;
    } catch (e: any) {
      console.error('API-Football Enrichment Error:', e.message);
      return null; // Fallback to ESPN on error
    }
  }

  private async fetchESPNMatches(dateString?: string): Promise<any[]> {
    // Determine the target date in YYYYMMDD format (Vietnam Time)
    const targetDateStr = dateString || new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
    
    const cacheKey = `espn_matches_vn_${targetDateStr}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate start date (-1 day) and end date (+1 day) to account for timezones
    const targetYear = parseInt(targetDateStr.slice(0, 4));
    const targetMonth = parseInt(targetDateStr.slice(4, 6)) - 1;
    const targetDay = parseInt(targetDateStr.slice(6, 8));
    
    const dateObj = new Date(Date.UTC(targetYear, targetMonth, targetDay));
    const prevDayObj = new Date(dateObj.getTime() - 24 * 60 * 60 * 1000);
    const nextDayObj = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
    
    const startStr = prevDayObj.toISOString().slice(0, 10).replace(/-/g, '');
    const endStr = nextDayObj.toISOString().slice(0, 10).replace(/-/g, '');

    // Fetch Enrichment Data (Hybrid API)
    const formattedTargetDate = `${targetYear}-${targetDateStr.slice(4, 6)}-${targetDateStr.slice(6, 8)}`;
    const enrichmentData = await this.getApiFootballEnrichment(formattedTargetDate);

    const promises = ESPN_LEAGUES.map((league) => {
      const url = `http://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${startStr}-${endStr}`;
      return axios.get(url)
        .then(res => res.data)
        .catch(() => null);
    });

    const results = await Promise.all(promises);
    let allMatches: any[] = [];

    results.forEach((data) => {
      if (!data || !data.events) return;
      const competitionName = data.leagues?.[0]?.name || 'Unknown';
      const competitionLogo = data.leagues?.[0]?.logos?.[0]?.href || '';

      const matches = data.events.reduce((acc: any[], event: any) => {
        // Filter strictly by GMT+7 target date
        const eventDate = new Date(event.date);
        const vnDateStr = new Date(eventDate.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
        if (vnDateStr !== targetDateStr) return acc;
        const homeCompetitor = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
        const awayCompetitor = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
        const statusType = event.status.type.state; // 'pre', 'in', 'post'
        
        let mappedStatus = 'SCHEDULED';
        if (statusType === 'in') mappedStatus = 'LIVE';
        else if (statusType === 'post') mappedStatus = 'FT';
        
        if (event.status.type.shortDetail === 'HT') mappedStatus = 'HT';

        // Try to match with Enrichment Data
        const homeKey = homeCompetitor.team.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
        const awayKey = awayCompetitor.team.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
        const matchKey = `${homeKey}_${awayKey}`;
        let enriched = enrichmentData ? enrichmentData[matchKey] : null;
        if (!enriched && enrichmentData) {
          const keys = Object.keys(enrichmentData);
          for (const key of keys) {
            const parts = key.split('_');
            if (parts.length === 2) {
              const apiHome = parts[0];
              const apiAway = parts[1];
              // Use length-based substring check to avoid matching 'man' with 'oman' incorrectly,
              // but for now simple includes is fine since it's constrained by BOTH home and away matching.
              if ((homeKey.includes(apiHome) || apiHome.includes(homeKey)) && 
                  (awayKey.includes(apiAway) || apiAway.includes(awayKey))) {
                enriched = enrichmentData[key];
                break;
              }
            }
          }
        }

        let mappedRound = event.competitions[0]?.notes?.[0]?.headline || (event.season?.slug ? event.season.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : event.season?.year?.toString()) || '';
        // Override round with enriched data if available
        if (enriched && enriched.round) {
          if (mappedRound.toLowerCase().includes('group') && enriched.round.toLowerCase().includes('group') && mappedRound.toLowerCase() !== enriched.round.toLowerCase()) {
            mappedRound = `${mappedRound} - ${enriched.round}`;
          } else {
            mappedRound = enriched.round;
          }
        }

        acc.push({
          id: event.id,
          competition: competitionName,
          competitionLogo: competitionLogo,
          homeTeam: {
            id: homeCompetitor.team.id,
            name: homeCompetitor.team.displayName,
            shortName: homeCompetitor.team.shortDisplayName || homeCompetitor.team.name,
            logo: homeCompetitor.team.logo || '⚽',
          },
          awayTeam: {
            id: awayCompetitor.team.id,
            name: awayCompetitor.team.displayName,
            shortName: awayCompetitor.team.shortDisplayName || awayCompetitor.team.name,
            logo: awayCompetitor.team.logo || '⚽',
          },
          homeScore: parseInt(homeCompetitor.score) || 0,
          awayScore: parseInt(awayCompetitor.score) || 0,
          kickoff: new Date(event.date),
          status: mappedStatus,
          minute: Math.floor((event.status.clock || 0) / 60),
          round: mappedRound,
          stadium: enriched?.stadium || event.competitions[0].venue?.fullName || 'Unknown Stadium',
        });
        return acc;
      }, []);
      allMatches = allMatches.concat(matches);
    });

    // Cache for 15 seconds to prevent rate-limiting and fast response
    await this.redisClient.set(cacheKey, JSON.stringify(allMatches), 'EX', 15);
    return allMatches;
  }

  async getLiveMatches() {
    const allMatches = await this.fetchESPNMatches();
    // Return both LIVE and HT
    return allMatches.filter(m => m.status === 'LIVE' || m.status === 'HT');
  }

  async getUpcomingMatches() {
    const allMatches = await this.fetchESPNMatches();
    const upcoming = allMatches.filter(m => m.status === 'SCHEDULED');
    // Sort by closest kickoff
    upcoming.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    return upcoming.slice(0, 10);
  }

  async getAllMatches(dateString?: string) {
    const allMatches = await this.fetchESPNMatches(dateString);
    allMatches.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    return allMatches;
  }

  async getMatchDetails(id: string, lang?: string) {
    const locale = lang || 'en';
    const cacheKey = `espn_match_details_${id}_${locale}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const url = `http://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${id}`;
      const res = await axios.get(url);
      let matchData = res.data;

      // Translate if lang is 'vi'
      if (locale === 'vi' && matchData.keyEvents && matchData.keyEvents.length > 0) {
        const translate = require('translate-google');
        // We will collect all texts to translate them in bulk or Promise.all
        try {
          const promises = matchData.keyEvents.map(async (event: any) => {
            if (event.text) {
              event.text = await translate(event.text, { to: 'vi' });
            }
            if (event.type && event.type.text) {
              event.type.text = await translate(event.type.text, { to: 'vi' });
            }
            return event;
          });
          await Promise.all(promises);
        } catch (transError) {
          console.error(`Translation error for match ${id}:`, transError);
        }
      }
      
      // Cache for 60 seconds
      await this.redisClient.set(cacheKey, JSON.stringify(matchData), 'EX', 60);
      return matchData;
    } catch (error) {
      console.error(`Error fetching match details for ${id}:`, error.message);
      return null;
    }
  }
}
