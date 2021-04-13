import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const whitelist = [
    'http://localhost:3000',
    'http://localhost:9000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:9000',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      //console.log(origin);
      if (!origin || whitelist.indexOf(origin) !== -1) {
        //console.log('allowed cors for:', origin);
        callback(null, true);
      } else {
        //console.log('blocked cors for:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
  await app.listen(9000);
}
bootstrap();
