import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const result = await this.authService.register(
        registerDto.email,
        registerDto.password,
        registerDto.role,
      );
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // for local dev
        path: '/',
      });
      (result as { access_token?: string }).access_token && delete (result as { access_token?: string }).access_token;
      return res.json(result);
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      return res.status(500).json({ error: 'Registration failed' });
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // for local dev
      path: '/',
    });
    (result as { access_token?: string }).access_token && delete (result as { access_token?: string }).access_token;
    return res.json(result);
  }
}