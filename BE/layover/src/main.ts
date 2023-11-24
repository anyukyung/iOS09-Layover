import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './response/custom-response';

import { readFileSync } from 'fs';
import { TokenResDto } from './oauth/dtos/token-res.dto';
import { PresignedUrlResDto } from './board/dtos/presigned-url-res.dto';
import { ValidationPipe } from '@nestjs/common';
import { CheckUsernameResDto } from './member/dtos/check-username-res.dto';
const httpsOptions = {
  key: readFileSync('./private.key'),
  cert: readFileSync('./certificate.crt'),
  ca: readFileSync('./ca_bundle.crt'),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true, // decorator 없는 property의 요청을 막아줍니다.
      // forbidNonWhitelisted: true, // whitelist 설정에 위반되는 property가 요청에 포함되면 요청 자체를 막아줍니다.
      transform: true, // 요청에서 받은 데이터를 DTO에서 정의한 타입으로 변환해줍니다.
    }),
  );
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