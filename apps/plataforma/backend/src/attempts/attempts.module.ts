import { Module } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de tentativas de avaliação. Permite aos alunos criar
 * tentativas, registrar respostas e finalizar com cálculo de nota.
 */
@Module({
  imports: [PrismaModule],
  controllers: [AttemptsController],
  providers: [AttemptsService],
})
export class AttemptsModule {}