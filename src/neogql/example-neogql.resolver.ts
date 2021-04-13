import { Resolver, Query, Args, ResolveProperty, ResolveField, Parent } from '@nestjs/graphql';
import { Movie } from '../graphql';
import { relation, node } from 'cypher-query-builder';

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NEO4J_QUERYBUILDER } from 'src/neo4j/neo4j.const';

@Injectable()
@Resolver('Movie')
export class NeogqlResolver {
  constructor(@Inject(NEO4J_QUERYBUILDER) private readonly dbQueryBuilder) {
    //console.log('THIS IS CONFIG :', config);
    //console.log('THIS IS DRIVER :', driver);
  }

  @Query()
  async getMovies(): Promise<Movie> {
    const movies = (await this.dbQueryBuilder
      .matchNode('movies', 'Movie')
      .return([
        {
          movies: [
            {
              id: 'id',
              title: 'title',
              year: 'year',
            },
          ],
        },
      ])
      .run()) as any;

    return movies;
  }

  @Query('movie')
  async getMovieById(
    @Args('id')
    id: string,
  ): Promise<any> {
    const movie = (await this.dbQueryBuilder
      .matchNode('movie', 'Movie')
      .where({ 'movie.id': id })
      .return([
        {
          movie: [
            {
              id: 'id',
              title: 'title',
              year: 'year',
            },
          ],
        },
      ])
      .run()) as any;

    if (movie.length === 0) {
      throw new NotFoundException(`Movie id '${id}' does not exist in database `);
    }

    return movie[0];
  }

  @ResolveField()
  async actors(@Parent() movie: any) {
    const { id } = movie;
    return (await this.dbQueryBuilder
      .match([node('actors', 'Actor'), relation('in'), node('movie', 'Movie')])
      .where({ 'movie.id': id })
      .return([
        {
          actors: [
            {
              id: 'id',
              name: 'name',
              born: 'born',
            },
          ],
        },
      ])
      .run()) as any;
  }
}
