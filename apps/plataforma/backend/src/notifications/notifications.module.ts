import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

/**
 * Módulo de notificações. Simples, responsável por abstrair o
 * envio de notificações por email ou outros canais. Nesta
 * versão inicial o envio é um stub síncrono.
 */
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}