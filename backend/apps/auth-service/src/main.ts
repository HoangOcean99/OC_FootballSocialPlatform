import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_PASSWORD ? { servername: process.env.REDIS_HOST } : undefined,
    },
  });

  await app.startAllMicroservices();
  
  // Render requires Web Services to bind to a port, otherwise it fails the deploy.
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Auth Service is running on port ${port} (HTTP for Render health check)`);
}
bootstrap();
