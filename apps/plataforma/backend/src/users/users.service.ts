import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UpsertGitHubUser {
  login: string;
  name: string;
  email: string;
}

/**
 * Serviço de utilizadores responsável por encapsular o acesso ao
 * modelo User no banco de dados. Permite criar ou atualizar
 * utilizadores provenientes do GitHub e buscar por identificador.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async upsertGitHubUser(data: UpsertGitHubUser) {
    return this.prisma.user.upsert({
      where: { email: data.email },
      update: { name: data.name },
      create: {
        email: data.email,
        name: data.name,
        provider: 'github',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}