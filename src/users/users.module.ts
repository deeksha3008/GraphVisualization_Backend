import { Module } from '@nestjs/common';
import { Neo4jModule } from 'nest-neo4j';
import { UsersService } from './users.service';

@Module({
  imports: [
    Neo4jModule.forRoot({
      scheme: 'neo4j',
      host: 'localhost',
      port: 7687,
      username: 'neo4j',
      password: 'password',
    }),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

