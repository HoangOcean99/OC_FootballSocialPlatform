import { Controller, Get, Query, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('live')
  async getLiveMatches() {
    return this.matchesService.getLiveMatches();
  }

  @Get('upcoming')
  async getUpcomingMatches() {
    return this.matchesService.getUpcomingMatches();
  }

  @Get()
  async getAllMatches(@Query('date') date?: string) {
    return this.matchesService.getAllMatches(date);
  }

  @Get(':id/details')
  async getMatchDetails(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.matchesService.getMatchDetails(id, lang);
  }
}
