import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo responsável por prover uma instância compartilhada do PrismaClient.
 * A anotação @Global torna a injeção disponível em toda a aplicação sem
 * necessidade de importá-lo em cada módulo individualmente.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}