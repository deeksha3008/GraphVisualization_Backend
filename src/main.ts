import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });
// console.log('API Key:', process.env.OPENAI_API_KEY);
async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Create an app instance from the AppModule
  app.enableCors({
    origin: 'http://localhost:4200', // Allow only this origin or use a broader pattern if needed
    methods: 'GET, POST, PUT, DELETE, OPTIONS', // Allowed HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Explicitly allow Authorization and other needed headers
    credentials: true, // This allows session cookies to be sent back and forth
  });
  await app.listen(3000); // Listen on port 3000
}
bootstrap();

