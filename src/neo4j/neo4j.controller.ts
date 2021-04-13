import { Controller, Get, Post, Put } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Controller('neo4j')
export class Neo4jController {
  constructor(private readonly retriveNodes: Neo4jService) {}

  @Get()
  async getAll() {
    const response = await this.retriveNodes.read(`MATCH (n) RETURN count(n) AS count`);
    return response;
  }

  @Get()
  async get(query: string) {
    const response = await this.retriveNodes.read(query);
    return response;
  }

  @Post()
  async post(query: string) {
    const response = await this.retriveNodes.write(query);
    return response;
  }

  @Put()
  async put(query: string) {
    const response = await this.retriveNodes.write(query);
    return response;
  }
}
