import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

/**
 * Controller responsável pelas rotas públicas de autenticação. Atualmente
 * expõe apenas o endpoint de callback do GitHub. Em implementações
 * futuras, pode ser estendido para suporte a login por e mail/senha,
 * refresh tokens, logout, etc.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Gera a URL de autorização do GitHub. Retorna o link para ser usado
   * no front‑end e armazena o parâmetro state em um cookie de sessão
   * para validação posterior.
   */
  @Get('login')
  login(@Res() res: Response) {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GITHUB_REDIRECT_URI');
    const state = randomUUID();
    // define cookie de estado para proteger contra CSRF
    res.cookie('github_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      clientId ?? '',
    )}&redirect_uri=${encodeURIComponent(
      redirectUri ?? '',
    )}&state=${encodeURIComponent(state)}&scope=read:user%20user:email`;
    return res.json({ authorizationUrl: authUrl, state });
  }

  /**
   * Endpoint chamado pelo front‑end após o usuário autorizar a aplicação
   * no GitHub. Valida o state, troca o código por access token e emite
   * um JWT de aplicação, retornando as informações do usuário.
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const storedState = req.cookies?.github_oauth_state;
    if (!state || !storedState || state !== storedState) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const { access_token, user } = await this.authService.githubCallback(code);
    // Gera cookie com JWT para chamadas autenticadas
    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    return res.json({ user });
  }

  /**
   * Devolve os dados do utilizador logado. Necessita de autenticação via JWT.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const { userId } = req.user;
    const user = await this.usersService.findById(userId);
    return { user };
  }

  /**
   * Remove os cookies de autenticação e termina a sessão.
   */
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('github_oauth_state');
    return res.json({ ok: true });
  }

  /**
   * Suporte ao callback antigo para compatibilidade. Continua aceitando
   * POST na rota github/callback para integradores existentes.
   */
  @Post('github/callback')
  async githubCallbackPost(@Body('code') code: string) {
    return this.authService.githubCallback(code);
  }
}