//import { IsAuthenticatedDirective, HasRoleDirective, HasScopeDirective } from 'graphql-auth-directives';
import {
  IsAuthenticatedDirective,
  HasRoleDirective,
  HasSingleRoleDirective,
  HasScopeDirective,
} from './directives/authorization';
import { GraphQLUpload } from 'graphql-upload';
import { GraphQLSchema, makeAugmentedSchema, neo4jgraphql, assertSchema, searchSchema } from 'neo4j-graphql-js';
import { typeDefs } from './neogql.schema';
import { Logger } from '@nestjs/common';
import { createQueryBuilder } from '../neo4j/neo4j.utils';
import { LoginError, ValidationError } from './neogql.errors';
import * as jwt from 'jsonwebtoken';
import { axiosGqlServiceQuery } from '../api';
//const jwt = require('jsonwebtoken');

const createResolvers = (driver, dbQueryBuilder): Record<string, any> => {
  return {
    Profile: {
      fullName: (object, params, ctx, resolveInfo) => {
        return `${object.firstName} ${object.lastName}`;
      },
    },
    Upload: GraphQLUpload,
    Query: {
      Movie: (object, params, ctx, resolveInfo) => {
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
      Login: async (object, params, ctx, resolveInfo) => {
        const userInfos = (await dbQueryBuilder
          .matchNode('user', 'User')
          .where(params.username ? { 'user.username': params.username } : { 'user.email': params.email })
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
          throw new LoginError({ message: 'Email address is incorrect' });
        } else if (params.password !== userInfos[0].password) {
          throw new LoginError({ message: 'Password is incorrect' });
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
    Mutation: {
      CreateUser: async (object, params, ctx, resolveInfo) => {
        const { username, email, password } = params.data;
        console.log(params.data);
        const usernameValidation = await axiosGqlServiceQuery('ValidateUsername', { username }, [
          'isInvalid',
          'message',
        ])
          .then((res: { data: Record<string, any> }) => {
            return res.data.query;
          })
          .catch((error) => {
            console.error('Error occured while validating username\n', error.message);
            throw new Error(error.message.split('\n')[0]);
          });
        console.log('TEst');
        if (usernameValidation.isInvalid) {
          throw new ValidationError({ message: usernameValidation.message });
        }
        console.log('Username passed');
        const emailValidation = await axiosGqlServiceQuery('ValidateEmail', { email }, ['isInvalid', 'message'])
          .then((res: { data: Record<string, any> }) => {
            return res.data.query;
          })
          .catch((error) => {
            console.error('Error occured while validating email\n', error.message);
            throw new Error(error.message.split('\n')[0]);
          });
        if (emailValidation.isInvalid) {
          throw new ValidationError({ message: emailValidation.message });
        }
        console.log('Email passed');
        const passwordValidation = await axiosGqlServiceQuery('ValidatePassword', { password }, [
          'isInvalid',
          'message',
        ])
          .then((res: { data: Record<string, any> }) => {
            return res.data.query;
          })
          .catch((error) => {
            console.error('Error occured while validating password\n', error.message);
            throw new Error(error.message.split('\n')[0]);
          });
        if (passwordValidation.isInvalid) {
          throw new ValidationError({ message: passwordValidation.message });
        }
        console.log('Password passed');
        return 'Pass';
      },
    },
  };
};

export const createAugmentedSchema = (driver, dbQueryBuilder, pTypeDefs?: string): GraphQLSchema => {
  const logger = new Logger('AugmentedSchema', true);
  logger.log('Creating augmented schema');
  const inputTypeDefs = pTypeDefs || typeDefs;
  const augmentedSchema = makeAugmentedSchema({
    typeDefs: inputTypeDefs,
    resolvers: createResolvers(driver, dbQueryBuilder),
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
        hasScope: false,
      },
      query: {
        exclude: ['File'],
      },
      mutation: {
        exclude: ['File'],
      },
      debug: true,
    },
  });
  assertSchema({ schema: augmentedSchema, driver: driver, dropExisting: true, debug: true });
  searchSchema({ schema: augmentedSchema, driver: driver, dropExisting: true, debug: true });
  logger.log('Finished creating augmented schema');
  return augmentedSchema;
};
