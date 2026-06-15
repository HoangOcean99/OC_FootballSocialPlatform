import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PredictionMatch, PredictionMatchDocument } from './prediction-match.schema';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(PredictionMatch.name) private predMatchModel: Model<PredictionMatchDocument>,
  ) {}

  async getActivePredictions() {
    return this.predMatchModel.find().exec();
  }
}
