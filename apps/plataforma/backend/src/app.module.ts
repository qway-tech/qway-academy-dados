import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogModule } from './catalog/catalog.module';
import { AssessmentModule } from './assessment/assessment.module';
import { AttemptsModule } from './attempts/attempts.module';
import { ProgressModule } from './progress/progress.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Carrega variáveis de ambiente a partir do ficheiro .env e torna-as globais
    ConfigModule.forRoot({ isGlobal: true }),
    // Módulo de acesso ao banco de dados via Prisma
    PrismaModule,
    // Módulos de domínio
    AuthModule,
    UsersModule,
    CatalogModule,
    AssessmentModule,
    AttemptsModule,
    ProgressModule,
    NotificationsModule,
  ],
})
export class AppModule {}