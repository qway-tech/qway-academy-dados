import { SetMetadata } from '@nestjs/common';

/**
 * Define metadados de papéis/roles para um manipulador ou classe. Quando
 * utilizado em conjunto com RolesGuard, permite restringir o acesso de
 * rotas a utilizadores com perfis específicos. Exemplos: @Roles('ADMIN').
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);