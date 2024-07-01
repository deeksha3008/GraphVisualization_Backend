import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GraphModule } from './graph/graph.module';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Neo4jService, Neo4jTransactionInterceptor } from 'nest-neo4j/dist';
import { CrudController } from './graph/crud/crud.controller';
import { TextProcessingService } from './graph/text-processing/text-processing.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { EventsGateway } from './graph/events/events.gateway';
import { GraphController } from './graph/graph.controller';
import { GraphService } from './graph/graph.service';
@Module({
  imports: [AuthModule,GraphModule,HttpModule,EventsGateway],
  controllers: [AppController,CrudController,GraphController],
  providers: [AppService,TextProcessingService,GraphService],
})
export class AppModule {}


