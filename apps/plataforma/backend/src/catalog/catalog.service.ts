import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Serviço de catálogo. Fornece métodos para obter trilhas completas e
 * detalhes individuais a partir do banco de dados. O Prisma cuida
 * das relações entre Trail e Module.
 */
@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  findAllTrails() {
    return this.prisma.trail.findMany({
      include: { modules: true },
    });
  }

  findTrailBySlug(slug: string) {
    return this.prisma.trail.findUnique({
      where: { slug },
      include: { modules: true },
    });
  }

  /**
   * Recupera um módulo pelo seu id, incluindo as lições associadas.
   */
  findModuleById(id: string) {
    return this.prisma.module.findUnique({
      where: { id },
      include: { lessons: true },
    });
  }

  /**
   * Recupera uma lição pelo seu id. Retorna o conteúdo básico da aula.
   */
  findLessonById(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
    });
  }

  /**
   * Cria uma nova trilha. Recebe slug único e título.
   */
  createTrail(data: { slug: string; title: string }) {
    return this.prisma.trail.create({
      data: {
        slug: data.slug,
        title: data.title,
      },
    });
  }

  /**
   * Cria um novo módulo associado a uma trilha.
   */
  createModule(data: { trailId: string; title: string }) {
    return this.prisma.module.create({
      data: {
        trailId: data.trailId,
        title: data.title,
      },
    });
  }

  /**
   * Cria uma nova lição associada a um módulo.
   */
  createLesson(data: { moduleId: string; title: string; content: string }) {
    return this.prisma.lesson.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
        content: data.content,
      },
    });
  }
}