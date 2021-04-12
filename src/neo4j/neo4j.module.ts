import { DynamicModule, Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { Neo4jConfigInterface } from './config/neo4j-config.interface';

import { createDriver } from './neo4j.utils';
import { NEO4J_DRIVER, NEO4J_CONFIG } from './neo4j.const';

import { Neo4jConfig } from './config/neo4j-config';

@Module({})
export class Neo4jModule {
  static forRoot(config?: Neo4jConfigInterface): DynamicModule {
    const Neo4jDatabaseProvider = [
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
    ];

    return {
      module: Neo4jModule,
      exports: [...Neo4jDatabaseProvider, Neo4jService],
      providers: [...Neo4jDatabaseProvider, Neo4jService],
    };
  }
}
