import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de progresso. Permite consultar o progresso do aluno
 * através de suas tentativas. A lógica aqui é simplificada e
 * poderá ser expandida para incluir certificados e snapshots.
 */
@Module({
  imports: [PrismaModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}