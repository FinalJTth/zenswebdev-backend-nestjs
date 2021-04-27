import { DynamicModule, Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { Neo4jConfigInterface } from './config/neo4j-config.interface';
import { Neo4jController } from '../neo4j/neo4j.controller';

import { createDriver, createQueryBuilder } from './neo4j.utils';
import { NEO4J_DRIVER, NEO4J_CONFIG, NEO4J_QUERYBUILDER } from './neo4j.const';

import { Neo4jConfig } from './config/neo4j-config';

const neo4jDatabaseProvider = [
  {
    provide: NEO4J_CONFIG,
    useValue: Neo4jConfig,
  },
  {
    provide: NEO4J_DRIVER,
    inject: [NEO4J_CONFIG],
    useFactory: async (config: Neo4jConfigInterface): Promise<any> => {
      return createDriver(config);
    },
  },
  {
    provide: NEO4J_QUERYBUILDER,
    inject: [NEO4J_CONFIG],
    useFactory: async (config: Neo4jConfigInterface): Promise<any> => {
      return createQueryBuilder(config);
    },
  },
];

@Module({
  exports: [...neo4jDatabaseProvider, Neo4jService],
  controllers: [Neo4jController],
  providers: [...neo4jDatabaseProvider, Neo4jService],
})
export class Neo4jModule {}

/*
@Module({})
export class Neo4jModule {
  static forRoot(config?: Neo4jConfigInterface): DynamicModule {
    const neo4jDatabaseProvider = [
      {
        provide: NEO4J_CONFIG,
        useValue: config || Neo4jConfig,
      },
      {
        provide: NEO4J_DRIVER,
        inject: [NEO4J_CONFIG],
        useFactory: async (config: Neo4jConfigInterface): Promise<any> => {
          return createDriver(config);
        },
      },
      {
        provide: NEO4J_QUERYBUILDER,
        inject: [NEO4J_CONFIG],
        useFactory: async (config: Neo4jConfigInterface): Promise<any> => {
          return createQueryBuilder(config);
        },
      },
    ];

    return {
      module: Neo4jModule,
      exports: [...neo4jDatabaseProvider, Neo4jService],
      controllers: [Neo4jController],
      providers: [...neo4jDatabaseProvider, Neo4jService],
    };
  }
}
*/
