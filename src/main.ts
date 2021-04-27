import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap', true);
  const whitelist = process.env.CORS_POLICY_WHITELIST.split(',');
  if (process.env.CORS_POLICY_ENABLE === 'true') {
    logger.log('Enable CORS Policy');
    if (whitelist[0].length === 0) {
      logger.error('No whitelist listed inside .env file');
      logger.error('Please make sure you have correctly listed the whitelist');
      logger.error('Fallback link : http://localhost:3000');
      whitelist[0] = 'http://localhost:3000';
    }
    app.enableCors({
      origin: (origin, callback) => {
        //console.log(origin);
        if (!origin || whitelist.indexOf(origin) !== -1) {
          //console.log('allowed cors for:', origin);
          callback(null, true);
        } else {
          //console.log('blocked cors for:', origin);
          callback(new Error(origin + ' is not whitelisted by CORS'));
        }
      },
      allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization',
      methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
      credentials: true,
    });
  }
  await app.listen(process.env.NESTJS_PORT ? parseInt(process.env.NESTJS_PORT) : 9000);
}
bootstrap();
