import { Controller, Get, Param, Query } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get('top')
  async getTopCompetitions() {
    const competitions = await this.competitionsService.getTopCompetitions();
    return competitions.map((c) => ({ id: c._id.toString(), ...c.toObject(), _id: undefined, __v: undefined }));
  }

  @Get()
  async getAllCompetitions() {
    const competitions = await this.competitionsService.getAllCompetitions();
    return competitions.map((c) => ({ id: c._id.toString(), ...c.toObject(), _id: undefined, __v: undefined }));
  }

  @Get(':id')
  async getCompetitionDetails(@Param('id') id: string) {
    const comp = await this.competitionsService.getCompetitionById(id);
    return { id: comp._id.toString(), ...comp.toObject(), _id: undefined, __v: undefined };
  }

  @Get(':id/standings')
  async getCompetitionStandings(@Param('id') id: string, @Query('season') season?: string) {
    return this.competitionsService.getCompetitionStandings(id, season);
  }

  @Get(':id/matches')
  async getCompetitionMatches(@Param('id') id: string, @Query('season') season?: string) {
    return this.competitionsService.getCompetitionMatches(id, season);
  }
}
