import { Controller, Get } from '@nestjs/common';
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
}
