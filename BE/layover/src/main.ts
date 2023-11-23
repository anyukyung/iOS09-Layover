import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './response/custom-response';

import { readFileSync } from 'fs';
import { TokenResDto } from './oauth/dtos/token-res.dto';
import { PresignedUrlResDto } from './board/dtos/presigned-url-res.dto';
import { CheckUsernameResDto } from './member/dtos/check-username-res.dto';
const httpsOptions = {
  key: readFileSync('./private.key'),
  cert: readFileSync('./certificate.crt'),
  ca: readFileSync('./ca_bundle.crt'),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.useGlobalFilters(new GlobalExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Layover API Documentation')
    .setDescription('The Layover API description')
    .setVersion('0.0.0.0.1')
    .addTag('Layover')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [TokenResDto, PresignedUrlResDto, CheckUsernameResDto],
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();