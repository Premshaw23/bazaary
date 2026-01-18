import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

import { QueueService } from '../queue/queue.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private queueService: QueueService,
  ) {}

  async register(email: string, password: string, role: string) {
    const user = await this.usersService.create(email, password, role);
    
    // Queue welcome email
    await this.queueService.addMailJob({
      to: email,
      subject: 'Welcome to Bazaary',
      type: 'welcome',
    });

    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.usersService.validatePassword(user, password);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user.id);

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string): Promise<void> {
    this.logger.log(`🔐 Forgot password request for: ${email}`);
    try {
      const resetToken = await this.usersService.generatePasswordResetToken(email);
      this.logger.log(`✅ Reset token generated: ${resetToken.substring(0, 10)}...`);
      
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      // Queue password reset email
      await this.queueService.addMailJob({
        to: email,
        subject: 'Reset Your Bazaary Password',
        type: 'password-reset',
        data: {
          resetToken,
          resetUrl,
        },
      });
      
      this.logger.log(`📧 Password reset email queued for: ${email}`);
      
      // DEVELOPMENT ONLY: Log reset URL to console since Redis might not be running
      console.log('\n' + '='.repeat(80));
      console.log('🔐 PASSWORD RESET REQUEST');
      console.log('='.repeat(80));
      console.log(`Email: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`Token: ${resetToken}`);
      console.log('='.repeat(80) + '\n');
      
    } catch (err) {
      this.logger.error(`❌ Error in forgotPassword: ${err.message}`);
      // Silently fail to prevent email enumeration
      // In production, you'd still want to log this for monitoring
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.usersService.resetPassword(token, newPassword);
  }
}
