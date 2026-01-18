import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(email: string, password: string, role: string): Promise<User> {
    // Check if user already exists
    const existing = await this.findByEmail(email);
    if (existing) {
      // You can throw a custom error or return a user-friendly message
      throw new Error('User with this email already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      passwordHash,
      role: role as any,
    });

    return await this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour expiry

    await this.usersRepository.update(user.id, {
      resetToken,
      resetTokenExpires,
    });

    return resetToken;
  }

  async validateResetToken(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { resetToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    if (user.resetTokenExpires < new Date()) {
      throw new NotFoundException('Reset token has expired');
    }

    return user;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.validateResetToken(token);

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.update(user.id, {
      passwordHash,
      resetToken: undefined,
      resetTokenExpires: undefined,
    });
  }
}