import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(@Res() res: Response) {
    try {
      const health = await this.healthService.checkHealth();
      const statusCode = health.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
      return res.status(statusCode).json(health);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('ready')
  async getReadiness(@Res() res: Response) {
    try {
      const readiness = await this.healthService.checkReadiness();
      const statusCode = readiness.ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
      return res.status(statusCode).json(readiness);
    } catch (error) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        ready: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get('live')
  async getLiveness(@Res() res: Response) {
    try {
      const liveness = await this.healthService.checkLiveness();
      return res.status(HttpStatus.OK).json(liveness);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        alive: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}