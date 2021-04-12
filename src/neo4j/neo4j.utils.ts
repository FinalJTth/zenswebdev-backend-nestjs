import neo4j from 'neo4j-driver';
import { Neo4jConfigInterface } from './config/neo4j-config.interface';
import { Logger } from '@nestjs/common';

export const createDriver = async (config: Neo4jConfigInterface) => {
  const logger = new Logger('Neo4jDriver', true);
  const link = `${config.scheme}://${config.host}:${config.port}`;
  logger.log('Connecting to neo4j database : ' + link);
  const driver = neo4j.driver(link, neo4j.auth.basic(config.username, config.password));
  await driver
    .verifyConnectivity()
    .then((res) => {
      logger.log('Successfully connect to neo4j database');
      logger.log('Response : ' + JSON.stringify(res));
    })
    .catch((error) => {
      logger.error('Cannot connect to neo4j database');
      logger.error('Error : ' + error);
    });
  const dbSession = driver.session();
  dbSession
    .run(`SHOW DATABASE ${config.database}`)
    .then((res) => {
      if (res.records.length === 0) {
        logger.log(`Default database \'${config.database}\' does not exist. Creating one`);
        dbSession
          .run(`CREATE DATABASE ${config.database} IF NOT EXISTS`)
          .then(() => {
            logger.log('Successfully created database');
            logger.log('Neo4j database successfully initialized');
          })
          .catch((error) => {
            logger.error('There has been an error creating database');
            logger.error(error.code);
            logger.error(error.message);
          });
      } else {
        logger.log(`Default database \'${config.database}\' is already existed`);
        logger.log('Neo4j database successfully initialized');
      }
    })
    .catch((error) => {
      logger.error(error.code);
      logger.error(error.message);
    });

  return driver;
};
