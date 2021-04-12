import { Injectable, Inject } from '@nestjs/common';
import { NEO4J_DRIVER, NEO4J_CONFIG } from './neo4j.const';
import { Session, session, Result } from 'neo4j-driver';
import { Logger } from '@nestjs/common';

@Injectable()
export class Neo4jService {
  constructor(@Inject(NEO4J_CONFIG) private readonly config, @Inject(NEO4J_DRIVER) private readonly driver) {
    //console.log('THIS IS CONFIG :', config);
    //console.log('THIS IS DRIVER :', driver);
  }

  private readonly logger = new Logger(Neo4jService.name, true);

  getReadSession(database?: string): Session {
    return this.driver.session({
      database: database || this.config.database,
      defaultAccessMode: session.READ,
    });
  }
  getWriteSession(database?: string): Session {
    return this.driver.session({
      database: database || this.config.database,
      defaultAccessMode: session.WRITE,
    });
  }

  read(cypher: string, params?: Record<string, any>, database?: string): Result {
    const session = this.getReadSession(database);
    return session.run(cypher, params);
  }

  write(cypher: string, params?: Record<string, any>, database?: string): Result {
    const session = this.getWriteSession(database);
    return session.run(cypher, params);
  }
}
