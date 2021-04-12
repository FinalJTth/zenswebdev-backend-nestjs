import * as dotenv from 'dotenv';
import { Neo4jConfigInterface } from './neo4j-config.interface';

dotenv.config();

export const Neo4jConfig: Neo4jConfigInterface = {
  scheme: process.env.NEO4J_SCHEME,
  host: process.env.NEO4J_HOST,
  port: process.env.NEO4J_PORT,
  username: process.env.NEO4J_USER,
  password: process.env.NEO4J_PASS,
  database: process.env.NEO4J_DBNAME_DEFAULT,
};
