import { UseInterceptors } from '@nestjs/common';
import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { neo4jgraphql } from 'neo4j-graphql-js';
import { Neo4jService } from '../neo4j/neo4j.service';
import { Neo4JGraphQLInterceptor } from './neogql.gqlinterceptor';

@Resolver('Movie')
@UseInterceptors(Neo4JGraphQLInterceptor)
export class NeogqlResolver {
  constructor(private readonly retriveNodes: Neo4jService) {}
  @Query()
  Movie(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  CreateMovie(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  UpdateMovie(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  DeleteMovie(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  MergeMovie(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Query()
  Actor(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  CreateActor(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  UpdateActor(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  DeleteActor(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  MergeActor(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  AddMovieActors(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  UpdateMovieActors(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  RemoveMovieActors(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }

  @Mutation()
  MergeMovieActors(object, params, ctx, resolveInfo) {
    return neo4jgraphql(object, params, ctx, resolveInfo);
  }
}
