import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth/auth.controller';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MatchesModule } from './matches/matches.module';
import { PostsModule } from './posts/posts.module';
import { CommunitiesModule } from './communities/communities.module';
import { UsersModule } from './users/users.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { PredictionsModule } from './predictions/predictions.module';
import { AdminModule } from './admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { UploadModule } from './upload/upload.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/footballverse',
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'footballverse-super-secret-2026',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    MatchesModule,
    PostsModule,
    CommunitiesModule,
    UsersModule,
    CompetitionsModule,
    PredictionsModule,
    UploadModule,
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>('REDIS_HOST') || 'localhost',
            port: parseInt(configService.get<string>('REDIS_PORT') || '6379', 10),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AdminModule,
    WebsocketsModule,
    ShopModule,
  ],
  controllers: [ApiGatewayController, AuthController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
