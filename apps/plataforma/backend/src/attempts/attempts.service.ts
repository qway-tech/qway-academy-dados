import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Serviço de tentativas. Encapsula a criação de tentativas, registro
 * de respostas e cálculo de pontuação ao finalizar. Utiliza o
 * Prisma para persistência transacional.
 */
@Injectable()
export class AttemptsService {
  constructor(private prisma: PrismaService) {}

  async createAttempt(assessmentId: string, userId: string) {
    return this.prisma.attempt.create({
      data: { assessmentId, userId },
    });
  }

  async answerQuestion(
    attemptId: string,
    questionId: string,
    choiceId: string,
  ) {
    return this.prisma.answer.create({
      data: { attemptId, questionId, choiceId },
    });
  }

  async finishAttempt(id: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id },
      include: {
        assessment: {
          include: {
            questions: { include: { choices: true } },
          },
        },
        answers: true,
      },
    });
    if (!attempt) {
      throw new BadRequestException('Tentativa não encontrada');
    }
    const totalQuestions = attempt.assessment.questions.length;
    const correctAnswers = attempt.answers.filter((answer) => {
      const question = attempt.assessment.questions.find(
        (q) => q.id === answer.questionId,
      );
      return question?.correctId === answer.choiceId;
    }).length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    await this.prisma.attempt.update({
      where: { id },
      data: { finishedAt: new Date(), score },
    });
    return { score };
  }
}