import { DynamicModule, Module } from '@nestjs/common';
import { Neo4jModule } from '../neo4j/neo4j.module';

import { createAugmentedSchema } from './neogql.augmentedSchema';

import { NEO4J_DRIVER } from '../neo4j/neo4j.const';
import { NEOGQL_AUGMENTED_SCHEMA } from './neogql.const';

import { assertSchema, searchSchema } from 'neo4j-graphql-js';

@Module({})
export class NeogqlModule {
  static forRootAsync(): DynamicModule {
    const neogqlProvider = [
      {
        imports: [Neo4jModule],
        provide: NEOGQL_AUGMENTED_SCHEMA,
        inject: [NEO4J_DRIVER],
        useFactory: (driver) => {
          const augmentedSchema = createAugmentedSchema();
          assertSchema({ schema: augmentedSchema, driver: driver, dropExisting: true, debug: true });
          searchSchema({ schema: augmentedSchema, driver: driver, dropExisting: true, debug: true });
          return augmentedSchema;
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
