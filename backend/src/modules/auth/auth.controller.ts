import { Controller, Post, Body, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Throttle({ default: { limit: 5, ttl: 60000 } }) // Limit to 5 requests per minute
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
    return res.json(result);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }, @Res() res: Response) {
    try {
      await this.authService.forgotPassword(body.email);
      return res.json({ 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    } catch (err: any) {
      // Always return success to prevent email enumeration
      return res.json({ 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; password: string },
    @Res() res: Response,
  ) {
    try {
      await this.authService.resetPassword(body.token, body.password);
      return res.json({ message: 'Password reset successful' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Invalid or expired reset token' });
    }
  }
}