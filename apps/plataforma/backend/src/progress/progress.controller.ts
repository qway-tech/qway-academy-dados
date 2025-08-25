import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller de progresso. Exponibiliza endpoint para obter o
 * progresso de um utilizador pelo seu id. Pode ser protegido por
 * autenticação para que o utilizador consulte o seu próprio
 * progresso via /me/progress.
 */
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get(':userId')
  getProgress(@Param('userId') userId: string) {
    return this.service.getProgressForUser(userId);
  }

  /**
   * Retorna um resumo de progresso agregado por trilha para um usuário.
   * Calcula o número de módulos concluídos e total de módulos com base
   * nas tentativas finalizadas. Pode ser utilizado para dashboards.
   */
  @Get(':userId/trails')
  getTrailProgress(@Param('userId') userId: string) {
    return this.service.getTrailProgressForUser(userId);
  }

  /**
   * Retorna os certificados para o usuário, considerando trilhas
   * nas quais todos os módulos foram concluídos (score final). Um
   * certificado inclui slug da trilha e a data de emissão (data atual).
   */
  @Get(':userId/certificates')
  getCertificates(@Param('userId') userId: string) {
    return this.service.getCertificatesForUser(userId);
  }
}