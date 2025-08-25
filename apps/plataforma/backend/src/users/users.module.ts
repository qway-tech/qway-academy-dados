import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de utilizadores. Centraliza acesso ao repositório de
 * utilizadores via Prisma e expõe endpoints para operações
 * básicas de consulta. Atualmente simples, pode evoluir para
 * incluir preferências e perfis.
 */
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}