import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

/**
 * Controller de catálogo. Expõe rotas públicas para listar trilhas e
 * recuperar uma trilha específica por slug. Pode ser estendido para
 * módulos e aulas.
 */
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('trails')
  getTrails() {
    return this.catalogService.findAllTrails();
  }

  @Get('trails/:slug')
  getTrail(@Param('slug') slug: string) {
    return this.catalogService.findTrailBySlug(slug);
  }

  /**
   * Retorna um módulo específico pelo seu identificador, incluindo as lições
   * associadas. Útil para exibir os detalhes de um módulo e suas aulas.
   */
  @Get('modules/:id')
  getModule(@Param('id') id: string) {
    return this.catalogService.findModuleById(id);
  }

  /**
   * Retorna uma lição específica pelo seu identificador. Pode ser
   * utilizado para carregar o conteúdo de uma aula individual.
   */
  @Get('lessons/:id')
  getLesson(@Param('id') id: string) {
    return this.catalogService.findLessonById(id);
  }

  /**
   * Cria uma nova trilha (trail) com slug e título. Restrito a administradores.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('trails')
  createTrail(@Body('slug') slug: string, @Body('title') title: string) {
    return this.catalogService.createTrail({ slug, title });
  }

  /**
   * Cria um novo módulo associado a uma trilha existente. Restrito a administradores.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('modules')
  createModule(@Body('trailId') trailId: string, @Body('title') title: string) {
    return this.catalogService.createModule({ trailId, title });
  }

  /**
   * Cria uma nova lição associada a um módulo. Restrito a administradores.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('lessons')
  createLesson(
    @Body('moduleId') moduleId: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.catalogService.createLesson({ moduleId, title, content });
  }
}