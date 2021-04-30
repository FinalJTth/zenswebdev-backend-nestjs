import { DynamicModule, Module } from '@nestjs/common';
import { Neo4jModule } from '../neo4j/neo4j.module';

import { createAugmentedSchema } from './neogql.augmentedSchema';

import { NEO4J_DRIVER, NEO4J_QUERYBUILDER } from '../neo4j/neo4j.const';
import { NEOGQL_AUGMENTED_SCHEMA } from './neogql.const';

@Module({})
export class NeogqlModule {
  static forRootAsync(): DynamicModule {
    const neogqlProvider = [
      {
        imports: [Neo4jModule],
        provide: NEOGQL_AUGMENTED_SCHEMA,
        inject: [NEO4J_DRIVER, NEO4J_QUERYBUILDER],
        useFactory: (driver, dbQueryBuilder) => {
          return createAugmentedSchema(driver, dbQueryBuilder);
        },
      },
    ];

    return {
      module: NeogqlModule,
      imports: [Neo4jModule],
      exports: [...neogqlProvider],
      controllers: [],
      providers: [...neogqlProvider],
    };
  }
}
