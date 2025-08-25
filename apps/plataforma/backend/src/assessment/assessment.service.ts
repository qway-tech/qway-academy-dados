import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Serviço de avaliações. Permite consultar avaliações completas por id,
 * incluindo questões e alternativas. Poderá ser estendido para
 * operações CRUD restritas a administradores.
 */
@Injectable()
export class AssessmentService {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: {
          include: { choices: true },
        },
      },
    });
  }

  /**
   * Lista todas as avaliações existentes no sistema. Inclui questões,
   * alternativas e o módulo ao qual a avaliação pertence.
   */
  findAll() {
    return this.prisma.assessment.findMany({
      include: {
        questions: {
          include: { choices: true },
        },
        module: true,
      },
    });
  }

  /**
   * Cria uma nova avaliação associada a um módulo. Recebe o id do módulo
   * e o título da avaliação. Não cria questões neste momento.
   */
  create(data: { moduleId: string; title: string }) {
    return this.prisma.assessment.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
      },
    });
  }

  /**
   * Atualiza uma avaliação existente. Por ora, apenas o título é
   * alterável. Caso não exista, o Prisma lançará um erro.
   */
  update(id: string, data: { title?: string }) {
    return this.prisma.assessment.update({
      where: { id },
      data: { title: data.title },
    });
  }
}