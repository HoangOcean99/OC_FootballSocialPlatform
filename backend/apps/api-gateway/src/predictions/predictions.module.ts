import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { PredictionMatch, PredictionMatchSchema } from './prediction-match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PredictionMatch.name, schema: PredictionMatchSchema }]),
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
