import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

/**
 * Controller de notificações. Exponibiliza endpoint POST para
 * enviar uma notificação. Em versões futuras este endpoint será
 * utilizado por workers de fila e não deverá ser público.
 */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  send(@Body('target') target: string, @Body('message') message: string) {
    return this.service.sendNotification(target, message);
  }
}