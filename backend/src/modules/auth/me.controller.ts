import { Controller, Get, Patch, Req, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class MeController {
  constructor(private jwtService: JwtService, private usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: Request) {
    // console.log('Cookies received at /auth/me:', req.cookies);
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
        status: user.status,
        phone: user.phone,
        joined: user.createdAt,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        address: user.metadata?.address || null,
        wishlist: Array.isArray(user.metadata?.wishlist) ? user.metadata.wishlist : [],
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Patch('me')
  async updateMe(@Req() req: Request, @Body() body: any) {
    const token = req.cookies['access_token'];
    if (!token) throw new UnauthorizedException('No token');
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');
      if ('phone' in body) user.phone = body.phone;
      if ('address' in body) user.metadata = { ...user.metadata, address: body.address };
      // Wishlist update logic
      if ('wishlist' in body && Array.isArray(body.wishlist)) {
        user.metadata = { ...user.metadata, wishlist: body.wishlist };
      }
      try {
        await (this.usersService as any).usersRepository.save(user);
      } catch (e) {
        throw new BadRequestException('Failed to update profile');
      }
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        joined: user.createdAt,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        address: user.metadata?.address || null,
        wishlist: Array.isArray(user.metadata?.wishlist) ? user.metadata.wishlist : [],
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
