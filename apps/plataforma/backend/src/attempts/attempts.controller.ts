import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller de tentativas. Expõe endpoints POST para criar
 * tentativas, registrar respostas e finalizar. Em versões futuras
 * estes endpoints deverão ser protegidos com autenticação.
 */
@UseGuards(JwtAuthGuard)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly service: AttemptsService) {}

  /**
   * Cria uma nova tentativa para o utilizador autenticado. O corpo deve
   * conter apenas o `assessmentId`; o userId é lido do token JWT.
   */
  @Post()
  async create(@Body('assessmentId') assessmentId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.service.createAttempt(assessmentId, userId);
  }

  /**
   * Registra a resposta de uma questão numa tentativa existente. Exige
   * que o utilizador esteja autenticado. Não valida autoria da
   * tentativa (assume que o token pertence ao proprietário).
   */
  @Post(':id/answer')
  async answer(
    @Param('id') id: string,
    @Body('questionId') questionId: string,
    @Body('choiceId') choiceId: string,
  ) {
    return this.service.answerQuestion(id, questionId, choiceId);
  }

  /**
   * Finaliza uma tentativa calculando a pontuação. Retorna o score.
   */
  @Post(':id/finish')
  async finish(@Param('id') id: string) {
    return this.service.finishAttempt(id);
  }
}