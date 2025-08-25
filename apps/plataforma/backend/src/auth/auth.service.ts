import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UsersService } from '../users/users.service';

interface GitHubTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
}

interface GitHubUserResponse {
  login: string;
  name: string | null;
  email: string | null;
}

/**
 * Serviço de autenticação responsável por trocar o código de autorização
 * do GitHub por um token, recuperar dados do utilizador e emitir um
 * JWT para a aplicação front‑end. Excepciona casos de erro com
 * UnauthorizedException para coerência com NestJS.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Executa o fluxo de callback do GitHub OAuth. Após obter o
   * código do cliente, troca por um access_token com a API do GitHub,
   * busca os dados do utilizador e realiza um upsert no banco de
   * dados. Por fim, emite um token JWT de curta duração.
   */
  async githubCallback(code: string) {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GITHUB_REDIRECT_URI');
    try {
      // Troca o código de autorização por um access_token
      const tokenRes = await axios.post<GitHubTokenResponse>(
        'https://github.com/login/oauth/access_token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        },
        {
          headers: { Accept: 'application/json' },
        },
      );
      const tokenData = tokenRes.data;
      if (!tokenData.access_token) {
        throw new UnauthorizedException('Token inválido');
      }
      // Recupera o perfil do utilizador a partir da API do GitHub
      const userRes = await axios.get<GitHubUserResponse>('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github+json',
        },
      });
      const { login, name, email } = userRes.data;
      // Faz upsert do utilizador na base de dados
      const user = await this.usersService.upsertGitHubUser({
        login,
        name: name ?? login,
        email: email ?? `${login}@github.com`,
      });
      // Cria payload do JWT
      const payload = { sub: user.id, role: user.role };
      const access_token = await this.jwtService.signAsync(payload);
      return { access_token, user };
    } catch (err) {
      throw new UnauthorizedException('Erro ao autenticar');
    }
  }
}