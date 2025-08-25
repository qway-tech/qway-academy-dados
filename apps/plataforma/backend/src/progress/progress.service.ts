import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Serviço de progresso. Agrega tentativas por utilizador para
 * retornar uma visão simplificada de progresso. Poderá ser
 * aprimorado para calcular percentuais de trilhas concluídas,
 * datas de conclusão e certificações.
 */
@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getProgressForUser(userId: string) {
    // Exemplo de agregação simples: retorna todas as tentativas do utilizador
    return this.prisma.attempt.findMany({
      where: { userId },
      include: { assessment: true },
    });
  }

  /**
   * Calcula progresso por trilha para um usuário. Para cada trilha a que o
   * usuário está associado via tentativas, retorna o número de módulos
   * concluídos (tentativas com finishedAt) e o total de tentativas por
   * trilha. O slug da trilha é retornado para identificação.
   */
  async getTrailProgressForUser(userId: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: { userId },
      include: {
        assessment: {
          include: {
            module: {
              include: { trail: true },
            },
          },
        },
      },
    });
    const progressMap: Record<string, { slug: string; completed: number; total: number }> = {};
    for (const attempt of attempts) {
      const trail = attempt.assessment.module.trail;
      if (!trail) continue;
      const trailId = trail.id;
      const slug = trail.slug;
      if (!progressMap[trailId]) {
        progressMap[trailId] = { slug, completed: 0, total: 0 };
      }
      progressMap[trailId].total += 1;
      if (attempt.finishedAt) {
        progressMap[trailId].completed += 1;
      }
    }
    return Object.values(progressMap);
  }

  /**
   * Obtém certificados de trilhas para um utilizador. Uma trilha dá
   * direito a certificado quando o número de módulos concluídos é igual
   * ao total de módulos tentados. O campo issuedAt é a data atual.
   */
  async getCertificatesForUser(userId: string) {
    const progress = await this.getTrailProgressForUser(userId);
    const now = new Date();
    return progress
      .filter((p) => p.total > 0 && p.completed === p.total)
      .map((p) => ({ trail: p.slug, issuedAt: now }));
  }
}