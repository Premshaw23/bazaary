import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const { to, subject, type, data } = job.data;
    
    this.logger.log(`📧 Processing ${type} email`);
    this.logger.log(`   To: ${to}`);
    this.logger.log(`   Subject: ${subject}`);
    
    // Log specific details based on email type
    if (type === 'password-reset' && data?.resetUrl) {
      this.logger.log(`   🔐 Password Reset URL: ${data.resetUrl}`);
      this.logger.log(`   Token: ${data.resetToken}`);
    } else if (type === 'welcome') {
      this.logger.log(`   👋 Welcome email`);
    }
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.logger.log(`✅ Email sent successfully to ${to}`);
  }
}
