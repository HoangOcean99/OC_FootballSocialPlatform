import { Controller, Get } from '@nestjs/common';
import { PredictionsService } from './predictions.service';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('active')
  async getActivePredictions() {
    const matches = await this.predictionsService.getActivePredictions();
    return matches.map((m) => ({ id: m._id.toString(), ...m.toObject(), _id: undefined, __v: undefined }));
  }
}
