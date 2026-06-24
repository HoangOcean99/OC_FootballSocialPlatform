import { Controller, Get, Post, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('active')
  async getActivePredictions() {
    const matches = await this.predictionsService.getActivePredictions();
    return matches.map((m) => ({ id: m._id.toString(), ...m.toObject(), _id: undefined, __v: undefined }));
  }

  @Get('date/:dateStr')
  async getPredictionsByDate(@Param('dateStr') dateStr: string) {
    const matches = await this.predictionsService.getPredictionsByDate(dateStr);
    return matches.map((m: any) => ({ id: m._id.toString(), ...m.toObject(), _id: undefined, __v: undefined }));
  }

  @Get('my-bets')
  @UseGuards(JwtAuthGuard)
  async getMyBets(@Request() req: any) {
    const bets = await this.predictionsService.getMyBets(req.user.sub);
    return bets.map((b: any) => ({ id: b._id.toString(), ...b, _id: undefined, __v: undefined }));
  }

  @Get('my-bets/:id')
  @UseGuards(JwtAuthGuard)
  async getBetById(@Request() req: any, @Param('id') id: string) {
    const bet = await this.predictionsService.getBetById(req.user.sub, id);
    return { id: bet._id.toString(), ...bet, _id: undefined, __v: undefined };
  }

  @Post(':id/bet')
  @UseGuards(JwtAuthGuard)
  async placeBet(
    @Request() req: any,
    @Param('id') matchId: string,
    @Body() body: { type: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | 'EXACT_SCORE', wager: number }
  ) {
    if (!body.type || !body.wager) throw new BadRequestException('Missing type or wager');
    const bet = await this.predictionsService.placeBet(req.user.sub, matchId, body.type, body.wager);
    return { id: bet._id.toString(), ...bet.toObject(), _id: undefined, __v: undefined };
  }
}
