import { IsAuthenticatedDirective, HasRoleDirective, HasScopeDirective } from 'graphql-auth-directives';
import { HasSingleRoleDirective } from './directives/authorization';
import { GraphQLSchema, makeAugmentedSchema, neo4jgraphql } from 'neo4j-graphql-js';
import { typeDefs } from './neogql.schema';
import { Logger } from '@nestjs/common';
import { createQueryBuilder } from '../neo4j/neo4j.utils';
import * as jwt from 'jsonwebtoken';
//const jwt = require('jsonwebtoken');

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
      const dbQueryBuilder = createQueryBuilder();
      const userInfos = (await dbQueryBuilder
        .matchNode('user', 'User')
        .where({ 'user.username': params.username })
        .return({
          user: {
            username: 'username',
            password: 'password',
            email: 'email',
            role: 'role',
          },
        })
        .run()) as any;
      if (userInfos.length === 0) {
        throw new Error("User doesn't exist");
      } else if (params.password !== userInfos[0].password) {
        throw new Error('Invalid password');
      }

      const userInfo = userInfos[0];
      //userInfo['reviews.grandstack.io/roles'] = [userInfo.role];
      //delete userInfo.role;
      //console.log(userInfo);
      const publicKey = jwt.sign(userInfo, process.env.JWT_SECRET);
      //const decoded = jwt.verify(publicKey, process.env.JWT_SECRET);
      //console.log(decoded);
      //console.log(decoded['username']);

      return publicKey;
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
    schemaDirectives: {
      isAuthenticated: IsAuthenticatedDirective,
      hasRole: HasSingleRoleDirective,
      hasScope: HasScopeDirective,
    },
    config: {
      experimental: true,
      auth: {
        isAuthenticated: true,
        hasRole: true,
        hasScope: true,
      },
    },
  });
  logger.log('Finished creating augmented schema');
  return augmentedSchema;
};
