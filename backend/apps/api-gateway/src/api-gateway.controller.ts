import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  health() {
    return {
      app: 'FootballVerse API Gateway',
      version: '1.0.0',
      status: '🟢 Running',
      timestamp: new Date().toISOString(),
      services: [
        'auth-service',
        'match-service',
        'community-service',
        'chat-service',
        'prediction-service',
      ],
    };
  }
}
