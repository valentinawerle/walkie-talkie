import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors(configService.cors);
  
  // Serve static files from the static directory
  app.useStaticAssets(join(__dirname, 'static'));
  
  // Set global prefix for API routes, but exclude the root path
  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.listen(configService.server.port, configService.server.host);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Configuration loaded from: ${configService.configFilePath}`);
  console.log(`Static files served from: ${join(__dirname, 'static')}`);
}
bootstrap();
