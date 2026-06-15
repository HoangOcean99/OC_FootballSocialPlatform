import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Competition, CompetitionDocument } from './competition.schema';

@Injectable()
export class CompetitionsService {
  constructor(@InjectModel(Competition.name) private compModel: Model<CompetitionDocument>) {}

  async getTopCompetitions() {
    return this.compModel.find().limit(5).exec();
  }

  async getAllCompetitions() {
    return this.compModel.find().exec();
  }
}
