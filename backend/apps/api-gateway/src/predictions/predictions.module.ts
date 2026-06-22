import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { PredictionMatch, PredictionMatchSchema } from './prediction-match.schema';
import { UserBet, UserBetSchema } from './user-bet.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PredictionMatch.name, schema: PredictionMatchSchema },
      { name: UserBet.name, schema: UserBetSchema },
    ]),
    UsersModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
