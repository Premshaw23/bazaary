import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class MeController {
  constructor(private jwtService: JwtService, private usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: Request) {
    console.log('Cookies received at /auth/me:', req.cookies);
    const token = req.cookies['access_token'];
    if (!token) throw new UnauthorizedException('No token');
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
