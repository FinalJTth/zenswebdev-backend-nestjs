import { Injectable, Inject, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { neo4jgraphql } from 'neo4j-graphql-js';

@Injectable()
export class Neo4JGraphQLInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const ctx = GqlExecutionContext.create(context);
    return neo4jgraphql(ctx.getRoot(), ctx.getArgs(), ctx.getContext(), ctx.getInfo());
  }
}
