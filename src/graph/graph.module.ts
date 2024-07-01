import { Module } from '@nestjs/common';
import { GraphService } from './graph.service';
import { GraphController } from './graph.controller';
import { Neo4jModule } from 'nest-neo4j/dist';  // Adjust based on your actual Neo4j module setup
import { TextProcessingService } from './text-processing/text-processing.service';
import { TextInputController } from './text-input/text-input/text-input.controller';
import { CrudController } from './crud/crud.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { EventsGateway } from './events/events.gateway';

@Module({
    imports: [Neo4jModule,HttpModule],
    providers: [GraphService, TextProcessingService,EventsGateway],
    controllers: [GraphController, TextInputController, CrudController],
    exports: [EventsGateway]
})
export class GraphModule {}

