//export type Neo4jScheme = 'neo4j' | 'neo4j+s' | 'neo4j+scc' | 'bolt' | 'bolt+s' | 'bolt+scc';

export interface Neo4jConfigInterface {
  scheme: string;
  host: string;
  port: number | string;
  username: string;
  password: string;
  database?: string;
}
