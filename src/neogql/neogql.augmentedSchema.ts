import { GraphQLSchema, makeAugmentedSchema, neo4jgraphql } from 'neo4j-graphql-js';
import { typeDefs } from './neogql.schema';
import { Logger } from '@nestjs/common';
import { createQueryBuilder } from '../neo4j/neo4j.utils';

const resolvers: Record<string, any> = {
  User: {
    fullName(object, params, ctx, resolveInfo) {
      return `${object.firstName} ${object.lastName}`;
    },
  },
  Query: {
    Movie(object, params, ctx, resolveInfo) {
      console.log(object);
      console.log(params);
      //console.log(ctx);
      //console.log(ctx.req);
      console.log(resolveInfo.operation.selectionSet.selections);
      console.log(resolveInfo.operation.selectionSet.selections[0].arguments);
      if (!ctx.req.user) {
        throw new Error('Request not authenticated');
      } else {
        return neo4jgraphql(object, params, ctx, resolveInfo);
      }
    },
    async Login(object, params, ctx, resolveInfo) {
      //object.body.query = `{ query: User(username: ${params.username}) { password }}`;
      const dbQueryBuilder = createQueryBuilder();
      const testUserInfo = (await dbQueryBuilder
        .matchNode('user', 'User')
        .where({ 'user.username': params.username })
        .return({
          user: {
            username: 'username',
            password: 'password',
            firstName: 'firstName',
          },
        })
        .run()) as any;
      console.log('TEST', testUserInfo);
      if (params.password !== testUserInfo[0].password) {
        throw new Error('Invalid password');
      } else if (testUserInfo.length === 0) {
        throw new Error("User doesn't exist");
      }
      console.log('Password checked');
      console.log(params);
      console.log(object);
      console.log(ctx.req.headers);
      return 'testjwt';
    },
  },
};

export const createAugmentedSchema = (pTypeDefs?: string): GraphQLSchema => {
  const logger = new Logger('AugmentedSchema', true);
  logger.log('Creating augmented schema');
  const inputTypeDefs = pTypeDefs || typeDefs;
  const augmentedSchema = makeAugmentedSchema({
    typeDefs: inputTypeDefs,
    resolvers,
    config: {
      experimental: true,
      auth: {
        isAuthenticated: true,
        hasRole: true,
      },
    },
  });
  logger.log('Finished creating augmented schema');
  return augmentedSchema;
};
