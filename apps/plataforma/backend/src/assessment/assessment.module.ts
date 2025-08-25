import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de avaliações. Responsável por expor avaliações (provas)
 * contendo questões e alternativas. Utilizado tanto para criação
 * de tentativas quanto para listagem pública.
 */
@Module({
  imports: [PrismaModule],
  controllers: [AssessmentController],
  providers: [AssessmentService],
})
export class AssessmentModule {}