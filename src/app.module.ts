import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Neo4jModule } from './neo4j/neo4j.module';

import { LoggerMiddleware } from './logger.middleware';

import { NeogqlResolver } from './neogql/neogql.resolver';
import { GraphQLModule, GraphQLFederationModule, GraphQLGatewayModule } from '@nestjs/graphql';
import { join } from 'path';

import { createDriver } from './neo4j/neo4j.utils';
import { Neo4jConfig } from './neo4j/config/neo4j-config';
import { createAugmentedSchema } from './neogql/neogql.augmentedSchema';

import neo4j from 'neo4j-driver';
import { NEO4J_DRIVER } from 'src/neo4j/neo4j.const';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      imports: [Neo4jModule.forRoot()],
      inject: [NEO4J_DRIVER],
      useFactory: async (driver): Promise<any> => ({
        debug: false,
        playground: true,
        //typePaths: ['./**/*.graphql'],
        schema: createAugmentedSchema(),
        context: ({ req }) => {
          return {
            driver,
            req,
          };
        },
        installSubscriptionHandlers: true,
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
