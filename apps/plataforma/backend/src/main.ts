import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilita CORS para permitir chamadas do front-end
  app.enableCors({
    origin: true,
    credentials: true,
  });
  // Aplica validação global baseada em decorators do class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  // Interpreta cookies para fluxos de autenticação
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  /* eslint-disable no-console */
  console.log(`✅ API rodando na porta ${port}`);
}

bootstrap().catch((err) => {
  /* eslint-disable no-console */
  console.error('Erro ao inicializar a API NestJS', err);
});