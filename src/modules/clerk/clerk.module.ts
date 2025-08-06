import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ClerkClientProvider } from './clerk.provider';

@Module({
  providers: [ClerkService, ClerkClientProvider],
  exports: [ClerkService],
})
export class ClerkModule {}
