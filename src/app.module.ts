import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Neo4jController } from './neo4j/neo4j.controller';
import { Neo4jModule } from './neo4j/neo4j.module';

import { LoggerMiddleware } from './logger.middleware';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), Neo4jModule.forRoot()],
  controllers: [AppController, Neo4jController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
