import { Controller, Post, Body, Get, Inject, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; email: string; password: string }) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.register' }, body));
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.login' }, body));
  }

  @Post('firebase')
  async firebaseAuth(@Body() body: { idToken: string }) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.firebase' }, body));
  }

  @Post('onboarding')
  async completeOnboarding(
    @Body() body: {
      userId: string;
      username?: string;
      favoriteClubs: string[];
      favoriteNationalTeams: string[];
    },
  ) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'auth.onboarding.complete' }, body),
    );
  }

  @Get('onboarding/data')
  async getOnboardingData() {
    return firstValueFrom(
      this.authClient.send({ cmd: 'auth.onboarding.data' }, {}),
    );
  }
}
