import { Injectable } from '@nestjs/common';

/**
 * Serviço de notificações. Stub inicial para envio de mensagens.
 * Em um ambiente real, integraria com SMTP, Webhooks ou outros
 * mecanismos de notificação assíncrona através de filas.
 */
@Injectable()
export class NotificationsService {
  sendNotification(target: string, message: string) {
    // Este é um exemplo simplificado, apenas devolve os parâmetros.
    return { target, message };
  }
}