import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de catálogo educativo. Responsável por listagem de trilhas e
 * módulos, permitindo ao front‑end descobrir o conteúdo disponível.
 */
@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}