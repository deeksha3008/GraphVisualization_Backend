// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
    constructor(private readonly neo4jService: Neo4jService) {}

    async findOne(username: string): Promise<User | undefined> {
        const session = this.neo4jService.getDriver().session();
        const result = await session.run(
          'MATCH (u:User {username: $username}) RETURN u',
          { username }
        );
        await session.close();
        if (result.records.length === 0) {
          return undefined;
        }
        return new User(result.records[0].get('u'));
      }

    async create(user: Partial<User>): Promise<User> {
        const session = this.neo4jService.getDriver().session();
            // Check if the user already exists
    const existingUser = await this.findOne(user.username);
    if (existingUser) {
        throw new BadRequestException('Username already exists'); // Throw an error if user exists
    }

        const hashedPassword = await bcrypt.hash(user.password, 10);
        const result = await session.run(
            'CREATE (u:User {username: $username, password: $password}) RETURN u',
            {
                username: user.username,
                password: hashedPassword,
            }
        );
        await session.close();
        return new User(result.records[0].get('u'));
    }
}


