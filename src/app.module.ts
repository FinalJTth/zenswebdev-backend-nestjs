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
import { NeogqlModule } from './neogql/neogql.module';

import neo4j from 'neo4j-driver';
import { NEO4J_DRIVER } from 'src/neo4j/neo4j.const';
import { NEOGQL_AUGMENTED_SCHEMA } from './neogql/neogql.const';

import * as jwt from 'jsonwebtoken';
import { assertSchema } from 'neo4j-graphql-js';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      imports: [Neo4jModule, NeogqlModule.forRootAsync()],
      inject: [NEO4J_DRIVER, NEOGQL_AUGMENTED_SCHEMA],
      useFactory: async (driver, augmentedSchema): Promise<any> => ({
        debug: false,
        playground: true,
        //typePaths: ['./**/*.graphql'],
        schema: augmentedSchema,
        context: ({ req }) => {
          /*
          const id_token = req.headers.authorization.replace('Bearer ', '');
          const { JWT_SECRET } = process.env;
          const uObj = jwt.verify(id_token, JWT_SECRET, {
            algorithms: ['HS256', 'RS256'],
          });
          console.log(uObj);
          */
          return {
            driver,
            req,
          };
        },
        installSubscriptionHandlers: true,
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
