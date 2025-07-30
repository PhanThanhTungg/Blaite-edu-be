import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { TopicsModule } from './modules/topics/topics.module';
import { KnowledgesModule } from './modules/knowledges/knowledges.module';
import { ClassesModule } from './modules/classes/classes.module';
import { GeminiModule } from './modules/gemini/gemini.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 5,
      },
      {
        name: 'medium',
        ttl: 3000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    TopicsModule,
    KnowledgesModule,
    ClassesModule,
    GeminiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
