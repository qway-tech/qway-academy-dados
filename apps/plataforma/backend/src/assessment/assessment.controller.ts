import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller de avaliações. Exponibiliza endpoint para obter
 * uma avaliação específica pelo identificador. Poderá ser estendido
 * para listar avaliações públicas ou criar novas.
 */
@Controller('assessments')
export class AssessmentController {
  constructor(private readonly service: AssessmentService) {}

  @Get(':id')
  getAssessment(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /**
   * Lista todas as avaliações disponíveis. Inclui questões e alternativas.
   */
  @Get()
  getAll() {
    return this.service.findAll();
  }

  /**
   * Cria uma nova avaliação para um módulo específico. Requer autenticação via JWT (normalmente restrito a administradores). O corpo deve conter `moduleId` e `title`.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body('moduleId') moduleId: string, @Body('title') title: string) {
    return this.service.create({ moduleId, title });
  }

  /**
   * Atualiza o título de uma avaliação existente. Também protegido por JWT. O corpo deve conter o novo `title`.
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body('title') title: string) {
    return this.service.update(id, { title });
  }
}