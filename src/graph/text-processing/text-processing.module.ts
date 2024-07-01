import { Module } from '@nestjs/common';
import { TextProcessingService } from './text-processing.service';
import { Neo4jService } from 'nest-neo4j';
import { HttpModule } from '@nestjs/axios';
import { EventsGateway } from '../events/events.gateway';

@Module({
  imports: [HttpModule],
  providers: [TextProcessingService, Neo4jService, EventsGateway],
  exports: [TextProcessingService]
})
export class TextProcessingModule {}
