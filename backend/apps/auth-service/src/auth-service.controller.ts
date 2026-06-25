import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

  @Get()
  healthCheck() {
    return 'Auth Service is running';
  }

  @MessagePattern({ cmd: 'auth.register' })
  register(@Payload() data: any) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'auth.login' })
  login(@Payload() data: any) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'auth.firebase' })
  firebaseAuth(@Payload() data: any) {
    return this.authService.firebaseAuth(data);
  }

  @MessagePattern({ cmd: 'auth.onboarding.complete' })
  completeOnboarding(@Payload() data: any) {
    return this.authService.completeOnboarding(data);
  }

  @MessagePattern({ cmd: 'auth.onboarding.data' })
  getOnboardingData() {
    return this.authService.getOnboardingData();
  }
}
